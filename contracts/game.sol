// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVerifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external view returns (bool);
}

contract Staking {
    IVerifier public verifier;  // Verifier contract instance
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public target;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event EmergencyWithdrawal(address indexed user, uint256 amount);


    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }

    function stake(uint256 expectedScore) external payable {
        require(msg.value > 0, "You must stake a non-zero amount of ETH");
        stakedAmount[msg.sender] += msg.value;
        target[msg.sender] = expectedScore;
        emit Staked(msg.sender, msg.value);
    }

    function withdraw(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input,
        uint256 score
    ) external {

        require(score >= target[msg.sender], "You have not reached target");
        uint256 balance = stakedAmount[msg.sender];
        require(balance > 0, "No staked balance to withdraw");
        require(address(this).balance >= balance, "Contract has insufficient balance");

        // 🔹 Verify the zero-knowledge proof first
        require(verifier.verifyProof(a, b, c, input), "Invalid proof");
        (bool success, ) = msg.sender.call{value: stakedAmount[msg.sender]}("");
        require(success, "ETH transfer failed");
        // 🔹 Deduct balance **after** verification
        stakedAmount[msg.sender] = 0;


        emit Withdrawn(msg.sender, balance);
    }

    /// 🔹 **Emergency function to withdraw all funds without ZKP**
    function emergencyWithdraw() external {
        uint256 balance = stakedAmount[msg.sender];
        require(balance > 0, "No staked balance to withdraw");
        require(address(this).balance >= balance, "Contract has insufficient balance");

        stakedAmount[msg.sender] = 0; // Reset balance

        payable(msg.sender).transfer(balance);
        emit EmergencyWithdrawal(msg.sender, balance);
    }


    function getStakedBalance(address user) external view returns (uint256) {
        return stakedAmount[user];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
