// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract deOracle {
    using ByteHasher for bytes;

    address public owner;
    mapping(address => bool) public worldIdVerified;
    mapping(address => bool) public ENSVerified;
    Request[] public requestList;

    struct Request {
        string requestText;
        address requestOrigin;
        uint256 bounty; //USDC
        uint256 reputation;
        uint256 maxAnswers;
        uint256[] submittedAnswers;
        bool active;
        uint256 timeStampPosted;
        uint256 timeStampDue;
    }

    struct Answer {
        uint256 answer;
        Oracle answerOrigin;
        bool acceptedAnswer;
        uint256 upVotes;
        uint256 downVotes;
    }

    struct Oracle {
        address payable oracleAddress;
        bool worldIdVerified;
        uint256 reputation;
    }

    function submitRequest(Request memory _newRequest) public {
        requestList.push(_newRequest);
    }

    function getRequestList() public view returns (Request[] memory) {
        return requestList;
    }

    //Verify worldId with worldId contract
    function checkVerified(address _address) public view returns (bool) {
        return worldIdVerified[_address] ? true : false;
    }

    function setVerified(address _address) private {
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
    IWorldID internal immutable worldId;
    /// @dev Whether a nullifier hash has been used already. Used to guarantee an action is only performed once by a single person
    mapping(uint256 => bool) internal nullifierHashes;

    event logId(string indexed walletAddress);

    /// @param _worldId The WorldID instance that will verify the proofs
    /// sets owner to contract deployer
    constructor(IWorldID _worldId) {
        worldId = _worldId;
        owner = msg.sender;
    }

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
        setVerified(signal);

        ///add address to array of verified addresses
    }

    modifier onlyOwner() {
        require(msg.sender == address(this));
        _;
    }
}

pragma solidity ^0.8.10;

interface IWorldID {
    /// @notice Reverts if the zero-knowledge proof is invalid.
    /// @param root The of the Merkle tree
    /// @param groupId The id of the Semaphore group
    /// @param signalHash A keccak256 hash of the Semaphore signal
    /// @param nullifierHash The nullifier hash
    /// @param externalNullifierHash A keccak256 hash of the external nullifier
    /// @param proof The zero-knowledge proof
    /// @dev  Note that a double-signaling check is not included here, and should be carried by the caller.
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
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
