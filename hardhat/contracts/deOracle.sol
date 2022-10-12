// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

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

contract deOracle is IUSDC {
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

    constructor() {}

    //TODO: accessControl
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
    }

    function addREP(address _address, uint256 _amount) private {
        addressToREP[_address] += _amount;
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

    function setWorldIdVerified(address _address) internal {
        addressToWorldIdVerified[_address] = true;
        addREP(_address, 100);
    }

    function setENSVerified(string memory _ensName) public {
        require(
            addressToENSVerified[msg.sender] == false,
            "Already ENS Verified"
        );
        addressToENSVerified[msg.sender] = true;
        addressToENSName[msg.sender] = _ensName;
        addREP(msg.sender, 50);
    }

    function upVote(uint256 _answerId) public {
        for (uint i = 0; i < answerList.length; i++) {
            if (answerList[i].id == _answerId) {
                require(
                    msg.sender != answerList[i].origin,
                    "Can't vote on your own Answer!"
                );
                require(
                    answerIdToAddressToVoted[_answerId][msg.sender] == false,
                    "Already voted."
                );
                answerIdToAddressToVoted[_answerId][msg.sender] = true;
                answerList[i].upVotes += 1;
                addREP(msg.sender, 1);
                addREP(answerList[i].origin, 3);
            }
        }
    }

    function downVote(uint256 _answerId) public {
        for (uint i = 0; i < answerList.length; i++) {
            if (answerList[i].id == _answerId) {
                require(
                    msg.sender != answerList[i].origin,
                    "Can't vote on your own Answer!"
                );
                require(
                    answerIdToAddressToVoted[_answerId][msg.sender] == false,
                    "Already voted."
                );
                answerIdToAddressToVoted[_answerId][msg.sender] = true;
                answerList[i].downVotes += 1;
                addREP(msg.sender, 1);
                deductREP(answerList[i].origin, 3);
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
                require(
                    requestPointer.active == true,
                    "Request is no longer active."
                );
                require(
                    msg.sender == requestPointer.origin,
                    "Only request author can accept an answer."
                );
                requestList[i].active = false;
                if (requestPointer.bounty > 0) {
                    usdcToken.transfer(
                        answerPointer.origin,
                        requestPointer.bounty
                    );
                    addressToBountyEarned[
                        answerPointer.origin
                    ] += requestPointer.bounty;
                    answerList[i].rewarded = true;
                }
            }
        }
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
