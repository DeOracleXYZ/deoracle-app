// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

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
    address public owner;

    //requestIdCounter AnswerIdCounter
    uint256 requestCount = 0;
    uint256 answerCount = 0;
    IUSDC private usdcToken = IUSDC(0xe11A86849d99F524cAC3E7A0Ec1241828e332C62);

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

    mapping(address => bool) public worldIdVerified;
    mapping(address => bool) public ENSVerified;
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

    constructor() {
        owner = msg.sender;
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
    }

    function postAnswer(uint256 _requestId, string memory _answerText) public {
        //not tested yet
        require(
            msg.sender != requestList[_requestId].origin,
            "You cant answer your own request."
        );
        require(
            requestList[_requestId].active == true,
            "Request already answered."
        );
        // TODO this does not work currently
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
        answerIdToRequestId[newAnswer.id] = _requestId;
        requestIdToAnswerIds[_requestId].push(newAnswer.id);
        //TODO currently not working
        requestIdToAddressToAnswered[_requestId][msg.sender] == true;
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

    //worldId verification complete?
    function checkWorldIdVerified(address _address) public view returns (bool) {
        return worldIdVerified[_address] ? true : false;
    }

    //worldID only modifier needed ***
    function setWorldIdVerified(address _address) public {
        worldIdVerified[_address] = true;
        addREP(_address, 100);
    }

    function setENSVerified(address _address) public {
        ENSVerified[_address] = true;
        addREP(_address, 50);
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

    modifier onlyOwner() {
        require(msg.sender == address(this));
        _;
    }

    //has not voted, and REP requirement.  Also sets voted to TRUE
    modifier eligibleVoter(uint256 _answerId, uint256 _minREP) {
        require(msg.sender != answerIdToAnswer[_answerId].origin);
        require(answerIdToAddressToVoted[_answerId][msg.sender] == false);
        // require(addressToREP[msg.sender] >= _minREP);
        answerIdToAddressToVoted[_answerId][msg.sender] = true;
        _;
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
