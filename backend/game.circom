pragma circom 2.2.1;

include "circomlib/circuits/comparators.circom";

template GameWinCondition() {
    signal input finalScore;
    signal output isWinner;

    component isGreater = LessThan(16); // 16-bit comparator, adjust as needed
    isGreater.in[0] <== 1000;  // Threshold
    isGreater.in[1] <== finalScore;

    isWinner <== 1 - isGreater.out; // If finalScore >= 1000, isGreater.out = 0, so isWinner = 1
}


component main = GameWinCondition();
