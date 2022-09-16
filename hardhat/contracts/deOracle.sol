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

contract deOracle {
    using ByteHasher for bytes;

    address public owner;

    //requestIdCounter AnswerIdCounter
    uint256 requestCount = 0;
    uint256 answerCount = 0;

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
    }

    function postAnswer(uint256 _requestId, string memory _answerText) public {
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
    }

    function getRequestList() public view returns (Request[] memory) {
        return requestList;
    }

    function getAnswerList() public view returns (Answer[] memory) {
        return answerList;
    }

    //worldId verification complete?
    function checkWorldIdVerified(address _address) public view returns (bool) {
        return worldIdVerified[_address] ? true : false;
    }

    //worldID only modifier needed ***
    function setWorldIdVerified(address _address) public {
        worldIdVerified[_address] = true;
    }

    function setENSVerified(address _address) public {
        ENSVerified[_address] = true;
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
