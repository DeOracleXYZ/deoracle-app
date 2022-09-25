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

    //requestIdCounter AnswerIdCounter
    uint256 requestCount = 0;
    uint256 answerCount = 0;
    IUSDC private usdcToken = IUSDC(0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2);

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
    // ID's to structs id -> Request/Answer
    mapping(uint256 => Request) public requestIdToRequest;
    mapping(uint256 => Answer) public answerIdToAnswer;

    Request[] public requestList;
    Answer[] public answerList;

    constructor(
        address _abacusConnectionManager,
        address _interchainGasPaymaster,
        uint32 _destinationDomain
    ) {
        // Transfer ownership of the contract to deployer
        _transferOwnership(msg.sender);
        // Set the addresses for the ACM and IGP
        // Alternatively, this could be done later in an initialize method
        _setAbacusConnectionManager(_abacusConnectionManager);
        _setInterchainGasPaymaster(_interchainGasPaymaster);
        destinationDomain = _destinationDomain;
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
        requestIdToRequest[newRequest.id] = requestList[newRequest.id];
        addREP(msg.sender, 10);
        sendMessageRequestList();
    }

    function postAnswer(uint256 _requestId, string memory _answerText) public {
        require(
            addressToREP[msg.sender] >= requestList[_requestId].reputation,
            "Not enough REP to answer."
        );
        require(
            msg.sender != requestList[_requestId].origin,
            "You cant answer your own request."
        );
        require(
            requestList[_requestId].active == true,
            "Request already answered."
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
        answerIdToAnswer[newAnswer.id] = answerList[newAnswer.id];
        answerIdToRequestId[newAnswer.id] = newAnswer.requestId;
        requestIdToAnswerIds[_requestId].push(newAnswer.id);

        requestIdToAddressToAnswered[_requestId][msg.sender] = true;
        addREP(msg.sender, 5);
        sendMessageAnswerList();
    }

    //should be private testing
    function addREP(address _address, uint256 _amount) public {
        addressToREP[_address] += _amount;
        sendMessageREP(_address, addressToREP[_address]);
        //      you can use an enum as a type prefix on the message encoding
        //      and do a sequence of if else in the handle implementation to switch on the message type
    }

    function deductREP(address _address, uint256 _amount) private {
        addressToREP[_address] -= _amount;
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

    function upVote(uint256 _answerId) public eligibleVoter(_answerId, 50) {
        Answer storage answerPointer = answerList[_answerId];
        answerPointer.upVotes += 1;

        addREP(msg.sender, 1);
        addREP(answerPointer.origin, 3);
    }

    function downVote(uint256 _answerId) public eligibleVoter(_answerId, 50) {
        Answer storage answerPointer = answerList[_answerId];
        answerPointer.downVotes += 1;
        addREP(msg.sender, 1);
        deductREP(answerPointer.origin, 3);
    }

    function selectAnswer(uint256 _answerId) public {
        Request storage requestPointer = requestList[
            answerIdToRequestId[_answerId]
        ];
        require(requestPointer.active == true);
        require(msg.sender == requestPointer.origin);
        Answer storage answerPointer = answerList[_answerId];
        addREP(answerPointer.origin, 15);
        addREP(msg.sender, 5);
        if (requestPointer.bounty > 0) {
            usdcToken.transfer(answerPointer.origin, requestPointer.bounty);
            addressToBountyEarned[answerPointer.origin] += requestPointer
                .bounty;
        }
        requestPointer.active = false;
        answerPointer.rewarded = true;
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
        RequestList,
        AnswerList
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
    event SentMessageRequestList(uint32 indexed origin);
    event SentMessageAnswerList(uint32 indexed origin);
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
    event ReceivedMessageRequestList(uint32 indexed origin);
    event ReceivedMessageAnswerList(uint32 indexed origin);

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
                new Request[](0),
                new Answer[](0)
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
                new Request[](0),
                new Answer[](0)
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
                new Request[](0),
                new Answer[](0)
            ),
            msg.value
        );
        emit SentMessageENS(_localDomain(), _address, _ensName);
    }

    function sendMessageRequestList() internal {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.RequestList,
                address(this),
                "",
                0,
                requestList,
                new Answer[](0)
            ),
            msg.value
        );
        emit SentMessageRequestList(_localDomain());
    }

    function sendMessageAnswerList() internal {
        sent += 1;
        sentTo[destinationDomain] += 1;
        _dispatchWithGas(
            destinationDomain,
            abi.encode(
                messageType.AnswerList,
                address(this),
                "",
                0,
                new Request[](0),
                answerList
            ),
            msg.value
        );
        emit SentMessageAnswerList(_localDomain());
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
            Request[] memory _requestList,
            Answer[] memory _answerList
        ) = abi.decode(
                _message,
                (messageType, address, string, uint256, Request[], Answer[])
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
        } else if (_messageType == messageType.RequestList) {
            // RequestList update
            emit ReceivedMessageRequestList(_origin);
            for (uint i = 0; i < _requestList.length; i++) {
                if (i < requestList.length) {
                    requestList[i] = _requestList[i];
                } else {
                    requestList.push(_requestList[i]);
                }
            }
        } else if (_messageType == messageType.AnswerList) {
            // RequestList update
            emit ReceivedMessageAnswerList(_origin);
            for (uint i = 0; i < _answerList.length; i++) {
                if (i < answerList.length) {
                    answerList[i] = _answerList[i];
                } else {
                    answerList.push(_answerList[i]);
                }
            }
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

    //has not voted, and REP requirement.  Also sets voted to TRUE
    modifier eligibleVoter(uint256 _answerId, uint256 _minREP) {
        require(msg.sender != answerIdToAnswer[_answerId].origin);
        require(answerIdToAddressToVoted[_answerId][msg.sender] == false);
        // require(addressToREP[msg.sender] >= _minREP);
        answerIdToAddressToVoted[_answerId][msg.sender] = true;
        _;
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
