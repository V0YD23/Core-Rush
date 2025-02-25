// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OceanTournament {
    address public owner;
    uint256 public stakeAmount = 0.1 ether;

    struct Player {
        uint256 score;
        bool isStaked;
    }

    mapping(address => Player) public players;
    address[] public stakedPlayers;

    event Staked(address indexed player, uint256 amount);
    event TournamentEnded(address[] winners, uint256[] rewards);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function stake() external payable {
        require(msg.value == stakeAmount, "Incorrect stake amount");
        require(msg.sender != address(0), "Wrong Address");
        require(!players[msg.sender].isStaked, "Already staked");

        players[msg.sender] = Player(0, true);
        stakedPlayers.push(msg.sender);

        emit Staked(msg.sender, msg.value);
    }

    function submitScore(uint256 score) external {
        require(players[msg.sender].isStaked, "Player has not staked");
        players[msg.sender].score = score;
    }

    function withdrawStake() external {
        Player storage player = players[msg.sender];
        require(player.isStaked, "No stake found");

        uint256 refundAmount = stakeAmount;

        player.isStaked = false;
        player.score = 0;

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");
    }

    function endTournament() external onlyOwner {
        require(stakedPlayers.length >= 2, "Not enough players");

        address firstPlace;
        address secondPlace;
        uint256 highestScore = 0;
        uint256 secondHighestScore = 0;

        // Find top two players
        for (uint i = 0; i < stakedPlayers.length; i++) {
            address playerAddr = stakedPlayers[i];
            uint256 playerScore = players[playerAddr].score;

            if (playerScore > highestScore) {
                secondHighestScore = highestScore;
                secondPlace = firstPlace;
                highestScore = playerScore;
                firstPlace = playerAddr;
            } else if (playerScore > secondHighestScore) {
                secondHighestScore = playerScore;
                secondPlace = playerAddr;
            }
        }

        uint256 totalPot = address(this).balance;
        uint256 firstPrize = (totalPot * 60) / 100;
        uint256 secondPrize = (totalPot * 40) / 100;

        // Distribute rewards
        (bool success1, ) = firstPlace.call{value: firstPrize}("");
        require(success1, "First prize transfer failed");

        (bool success2, ) = secondPlace.call{value: secondPrize}("");
        require(success2, "Second prize transfer failed");

        // Emit event
        address[] memory winners = new address[](2);
        uint256[] memory rewards = new uint256[](2);
        winners[0] = firstPlace;
        winners[1] = secondPlace;
        rewards[0] = firstPrize;
        rewards[1] = secondPrize;
        emit TournamentEnded(winners, rewards);

        // Reset contract state
        for (uint i = 0; i < stakedPlayers.length; i++) {
            delete players[stakedPlayers[i]];
        }
        delete stakedPlayers;
    }

    receive() external payable {}
}
