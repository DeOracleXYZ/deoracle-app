// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Router} from "@hyperlane-xyz/app/contracts/Router.sol";

interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

interface IUSDC {
    function transfer(address dst, uint wad) external returns (bool);

    function transferFrom(
        address src,
        address dst,
        uint wad
    ) external returns (bool);

    function balanceOf(address guy) external view returns (uint);

    function approve(address spender, uint256 amount) external returns (bool);
}

contract deOracle is IUSDC, Router {
    using ByteHasher for bytes;

    //requestIdCounter AnswerIdCounter TEMP modified TODO
    uint256 public requestCount;
    uint256 public answerCount;
    IUSDC private usdcToken = IUSDC(0xFC07D8Ab694afF02301eddBe1c308Fe4a68F6121);

    struct Request {
        uint256 id;
        string requestText;
        address origin;
        uint256 bounty; //USDC
        uint256 reputation;
        bool active;
        uint256 timeStampPosted;
        uint256 timeStampDue;
    }
    struct Answer {
        uint256 id;
        uint256 requestId;
        string answerText;
        address origin;
        bool rewarded;
        uint256 upVotes;
        uint256 downVotes;
    }

    Request private blankRequest =
        Request(0, "", address(this), 0, 0, false, 0, 0);
    Answer private blankAnswer = Answer(0, 0, "", address(this), false, 0, 0);

    //dev accessControl
    mapping(address => bool) public addressToWorldIdVerified;
    mapping(address => bool) public addressToENSVerified;
    mapping(address => string) public addressToENSName;
    mapping(address => uint256) public addressToREP;

    mapping(address => uint256) public addressToBountyEarned;

    mapping(uint256 => mapping(address => bool))
        public answerIdToAddressToVoted;
    mapping(uint256 => mapping(address => bool))
        public requestIdToAddressToAnswered;

    // ID's to opposite ID answer -> request vice versa
    mapping(uint256 => uint256[]) public requestIdToAnswerIds;
    mapping(uint256 => uint256) public answerIdToRequestId;

    Request[] public requestList;
    Answer[] public answerList;

    constructor(uint32 _destinationDomain) {
        // Transfer ownership of the contract to deployer
        _transferOwnership(msg.sender);

        destinationDomain = _destinationDomain;

        //mumbai => opkovan
        if (_destinationDomain == 0x6f702d6b) {
            _setAbacusConnectionManager(
                0xb636B2c65A75d41F0dBe98fB33eb563d245a241a
            );
            _setInterchainGasPaymaster(
                0x9A27744C249A11f68B3B56f09D280599585DFBb8
            );
        }
        //opkovan => mumbai
        if (_destinationDomain == 80001) {
            _setAbacusConnectionManager(
                0x740bEd6E4eEc7c57a2818177Fba3f9E896D5DE1c
            );
            _setInterchainGasPaymaster(
                0xD7D2B0f61B834D98772e938Fa64425587C0f3481
            );
        }

        //randomize Ids
        requestCount = _destinationDomain;
        answerCount = _destinationDomain;
    }

    function submitRequest(
        string memory _requestText,
        uint256 _bounty, //USDC
        uint256 _reputation,
        uint256 _timeStampDue
    ) public {
        if (_bounty > 0) {
            usdcToken.transferFrom(msg.sender, address(this), _bounty);
        }
        Request memory newRequest = Request({
            id: requestCount,
            requestText: _requestText,
            origin: msg.sender,
            bounty: _bounty,
            reputation: _reputation,
            active: true,
            timeStampPosted: block.timestamp,
            timeStampDue: _timeStampDue
        });
        requestCount++;
        requestList.push(newRequest);
        addREP(msg.sender, 10);
        sendMessageRequest(newRequest);
    }

    function postAnswer(uint256 _requestId, string memory _answerText) public {
        bool exists;
        Request memory requestPointer;
        for (uint i = 0; i < requestList.length; i++) {
            if (requestList[i].id == _requestId) {
                exists = true;
                requestPointer = requestList[i];
            }
        }
        require(exists == true, "Request already answered or doesnt exist");
        require(requestPointer.active == true, "Request is no longer active.");
        require(
            addressToREP[msg.sender] >= requestPointer.reputation,
            "Not enough REP to answer."
        );
        require(
            requestPointer.origin != msg.sender,
            "You cant answer your own request."
        );
        require(
            requestIdToAddressToAnswered[_requestId][msg.sender] == false,
            "You've already answered this request"
        );
        Answer memory newAnswer = Answer({
            id: answerCount,
            requestId: _requestId,
            answerText: _answerText,
            origin: msg.sender,
            rewarded: false,
            upVotes: 0,
            downVotes: 0
        });
        answerCount++;
        answerList.push(newAnswer);
        answerIdToRequestId[newAnswer.id] = newAnswer.requestId;
        requestIdToAnswerIds[_requestId].push(newAnswer.id);

        requestIdToAddressToAnswered[_requestId][msg.sender] = true;
        addREP(msg.sender, 5);
        sendMessageAnswer(newAnswer, msg.sender);
    }

    function addREP(address _address, uint256 _amount) private {
        addressToREP[_address] += _amount;
        sendMessageREP(_address, addressToREP[_address]);
    }

    function deductREP(address _address, uint256 _amount) private {
        addressToREP[_address] -= _amount;
        sendMessageREP(_address, addressToREP[_address]);
    }

    function getRequestList() public view returns (Request[] memory) {
        return requestList;
    }

    function getAnswerList() public view returns (Answer[] memory) {
        return answerList;
    }

    function getRequestIdToAnswerIds(uint256 _requestId)
        public
        view
        returns (uint256[] memory)
    {
        return requestIdToAnswerIds[_requestId];
    }

    function getREP() public view returns (uint256) {
        return addressToREP[msg.sender];
    }

    function getBountyEarned() public view returns (uint256) {
        return addressToBountyEarned[msg.sender];
    }

    //worldID only modifier needed ***
    function setWorldIdVerified(address _address) public {
        addressToWorldIdVerified[_address] = true;
        //sync worldID with Hyperlane
        sendMessageWorldId(_address);
        addREP(_address, 100);
    }

    function setENSVerified(string memory _ensName) public {
        require(
            addressToENSVerified[msg.sender] == false,
            "Already ENS Verified"
        );
        addressToENSVerified[msg.sender] = true;
        addressToENSName[msg.sender] = _ensName;
        sendMessageENS(msg.sender, _ensName);
        addREP(msg.sender, 50);
    }

    function upVote(uint256 _answerId) public {
        for (uint i = 0; i < answerList.length; i++) {
            if (answerList[i].id == _answerId) {
                require(msg.sender != answerList[i].origin);
                require(
                    answerIdToAddressToVoted[_answerId][msg.sender] == false
                );
                answerIdToAddressToVoted[_answerId][msg.sender] = true;
                answerList[i].upVotes += 1;
                addREP(msg.sender, 1);
                addREP(answerList[i].origin, 3);
                Answer memory answerPointer = answerList[i];
                // sendMessageAnswer(answerPointer, msg.sender);
            }
        }
    }

    function downVote(uint256 _answerId) public {
        for (uint i = 0; i < answerList.length; i++) {
            if (answerList[i].id == _answerId) {
                require(msg.sender != answerList[i].origin);
                require(
                    answerIdToAddressToVoted[_answerId][msg.sender] == false
                );
                answerIdToAddressToVoted[_answerId][msg.sender] = true;
                answerList[i].downVotes += 1;
                addREP(msg.sender, 1);
                deductREP(answerList[i].origin, 3);
                Answer memory answerPointer = answerList[i];
                // sendMessageAnswer(answerPointer, msg.sender);
            }
        }
    }

    function selectAnswer(uint256 _answerId) public {
        Request memory requestPointer;
        Answer memory answerPointer;
        for (uint i = 0; i < answerList.length; i++) {
            if (answerList[i].id == _answerId) {
                answerPointer = answerList[i];
                addREP(answerPointer.origin, 15);
            }
        }
        for (uint i = 0; i < requestList.length; i++) {
            if (requestList[i].id == answerIdToRequestId[_answerId]) {
                requestPointer = requestList[i];
                require(requestPointer.active == true);
                require(msg.sender == requestPointer.origin);
                requestList[i].active = false;
                if (requestPointer.bounty > 0) {
                    usdcToken.transfer(
                        answerPointer.origin,
                        requestPointer.bounty
                    );
                    addressToBountyEarned[
                        answerPointer.origin
                    ] += requestPointer.bounty;
                    sendMessageBounty(
                        answerPointer.origin,
                        requestPointer.bounty
                    );
                    answerList[i].rewarded = true;
                }
            }
        }
    }

    /////////////////////////HyperLane/////////////////////
    //////////////////////CrossChain Messaging///////////////////
    ///////////////////////////////////////////////////////////
    // ============ Events ============
    uint32 public destinationDomain;

    enum messageType {
        REP,
        WorldId,
        ENS,
        Request,
        Answer,
        selectAnswer,
        Bounty
    }

    event SentMessageREP(
        uint32 indexed origin,
        address indexed addr,
        uint256 indexed rep
    );
    event SentMessageWorldId(uint32 indexed origin, address indexed addr);
    event SentMessageENS(
        uint32 indexed origin,
        address indexed addr,
        string indexed ensName
    );
    event SentMessageBounty(
        uint32 indexed origin,
        address indexed addr,
        uint256 indexed bounty
    );
    event SentMessageRequest(uint32 indexed origin);
    event SentMessageAnswer(uint32 indexed origin);
    event ReceivedMessageREP(
        uint32 indexed origin,
        uint32 destination,
        address indexed addr,
        uint256 indexed rep
    );
    event ReceivedMessageWorldId(
        uint32 indexed origin,
        uint32 destination,
        address indexed addr
    );
    event ReceivedMessageENS(
        uint32 indexed origin,
        uint32 destination,
        address indexed addr,
        string indexed ensName
    );
    event ReceivedMessageBounty(
        uint32 indexed origin,
        address indexed addr,
        uint256 indexed bounty
    );
    event ReceivedMessageRequest(uint32 indexed origin);
    event ReceivedMessageAnswer(uint32 indexed origin);

    //sync REP change
    function sendMessageREP(address _address, uint256 _rep) internal {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.REP,
                _address,
                "",
                _rep,
                blankRequest,
                blankAnswer
            ),
            msg.value
        );
        emit SentMessageREP(_localDomain(), _address, _rep);
    }

    //sync WorldID change
    function sendMessageWorldId(address _address) internal {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.WorldId,
                _address,
                "",
                0,
                blankRequest,
                blankAnswer
            ),
            msg.value
        );
        emit SentMessageWorldId(_localDomain(), _address);
    }

    //TESTING with no encodedList
    function sendMessageENS(address _address, string memory _ensName) internal {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.ENS,
                _address,
                _ensName,
                0,
                blankRequest,
                blankAnswer
            ),
            msg.value
        );
        emit SentMessageENS(_localDomain(), _address, _ensName);
    }

    function sendMessageBounty(address _address, uint256 _bounty) internal {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.Bounty,
                _address,
                "",
                _bounty,
                blankRequest,
                blankAnswer
            ),
            msg.value
        );
        emit SentMessageBounty(_localDomain(), _address, _bounty);
    }

    function sendMessageRequest(Request memory _request) internal {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.Request,
                address(this),
                "",
                0,
                _request,
                blankAnswer
            ),
            msg.value
        );
        emit SentMessageRequest(_localDomain());
    }

    function sendMessageAnswer(Answer memory _answer, address _votedAddress)
        internal
    {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.Answer,
                _votedAddress,
                "",
                0,
                blankRequest,
                _answer
            ),
            msg.value
        );
        emit SentMessageAnswer(_localDomain());
    }

    function _handle(
        uint32 _origin,
        bytes32 _sender,
        bytes memory _message
    ) internal override {
        received += 1;
        receivedFrom[_origin] += 1;

        (
            messageType _messageType,
            address _address,
            string memory _string,
            uint256 _uint256,
            Request memory _request,
            Answer memory _answer
        ) = abi.decode(
                _message,
                (messageType, address, string, uint256, Request, Answer)
            );

        //REP update
        if (_messageType == messageType.REP) {
            emit ReceivedMessageREP(
                _origin,
                _localDomain(),
                _address,
                _uint256
            );
            addressToREP[_address] = _uint256;
        } else if (_messageType == messageType.WorldId) {
            //WorldId update
            emit ReceivedMessageWorldId(_origin, _localDomain(), _address);
            addressToWorldIdVerified[_address] = true;
        } else if (_messageType == messageType.ENS) {
            //ENS update
            emit ReceivedMessageENS(_origin, _localDomain(), _address, _string);
            addressToENSVerified[_address] = true;
            addressToENSName[_address] = _string;
        } else if (_messageType == messageType.Request) {
            // RequestList update
            emit ReceivedMessageRequest(_origin);
            for (uint i = 0; i < requestList.length; i++) {
                if (requestList[i].id == _request.id) {
                    requestList[i] = _request;
                    return;
                }
            }
            requestList.push(_request);
        } else if (_messageType == messageType.Answer) {
            // RequestList update
            emit ReceivedMessageAnswer(_origin);
            answerList.push(_answer);
            requestIdToAnswerIds[_answer.requestId].push(_answer.id);
            answerIdToRequestId[_answer.id] = _answer.requestId;
            requestIdToAddressToAnswered[_answer.requestId][
                _answer.origin
            ] = true;
            answerIdToAddressToVoted[_answer.id][_address] = true;
        } else if (_messageType == messageType.Bounty) {
            // RequestList update
            emit ReceivedMessageBounty(_origin, _address, _uint256);
            addressToBountyEarned[_address] += _uint256;
        }
    }

    // alignment preserving cast
    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    // alignment preserving cast
    function bytes32ToAddress(bytes32 _buf) public pure returns (address) {
        return address(uint160(uint256(_buf)));
    }

    /////////////////////////////////////////////////////
    //////////////////BOUNTY / ERC20 ///////////////////////
    ///////////////////////////////////////////////////////
    function approve(address _spender, uint256 _amount) public returns (bool) {
        return usdcToken.approve(_spender, _amount);
    }

    function balanceOf(address _address) public view returns (uint) {
        return usdcToken.balanceOf(_address);
    }

    function transfer(address _to, uint _amount) public returns (bool) {
        return usdcToken.transfer(_to, _amount);
    }

    function transferFrom(
        address _from,
        address to,
        uint _amount
    ) public returns (bool) {
        return usdcToken.transferFrom(_from, to, _amount);
    }

    /// @notice Thrown when attempting to reuse a nullifier
    error InvalidNullifier();
    /// @dev The World ID group ID (always 1)
    uint256 internal immutable groupId = 1;
    /// @dev The World ID instance that will be used for verifying proofs
    IWorldID internal immutable worldId =
        IWorldID(0xABB70f7F39035586Da57B3c8136035f87AC0d2Aa);
    /// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
    mapping(uint256 => bool) internal nullifierHashes;

    ///@param signal An arbitrary input from the user, usually the user's wallet address (check README for further details)
    /// @param root The root of the Merkle tree (returned by the JS widget).
    /// @param nullifierHash The nullifier hash for this proof, preventing double signaling (returned by the JS widget).
    /// @param proof The zero-knowledge proof that demostrates the claimer is registered with World ID (returned by the JS widget).
    /// @dev Feel free to rename this method however you want! We've used `claim`, `verify` or `execute` in the past.
    function verifyAndExecute(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public {
        // First, we make sure this person hasn't done this before
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();

        // We now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            abi
                .encodePacked("wid_staging_51dfce389298ae2fea0c8d7e8f3d326e")
                .hashToField(),
            proof
        );

        // We now record the user has done this, so they can't do it again (proof of uniqueness)
        nullifierHashes[nullifierHash] = true;

        // Finally, execute your logic here, for example issue a token, NFT, etc...
        // Make sure to emit some kind of event afterwards!
        setWorldIdVerified(signal);

        ///add address to array of verified addresses
    }

    // A counter of how many messages have been sent from this contract.
    uint256 public sent;
    // A counter of how many messages have been received by this contract.
    uint256 public received;
    // Keyed by domain, a counter of how many messages that have been sent
    // from this contract to the domain.
    mapping(uint32 => uint256) public sentTo;
    // Keyed by domain, a counter of how many messages that have been received
    // by this contract from the domain.
    mapping(uint32 => uint256) public receivedFrom;

    // ============ External functions ============

    /**
     * @notice Sends a message to the _destinationDomain. Any msg.value is
     * used as interchain gas payment.
     * @param _destinationDomain The destination domain to send the message to.
     */
}

library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}
