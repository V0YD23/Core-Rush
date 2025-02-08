pragma circom 2.2.1;

include "circomlib/circuits/comparators.circom";

template GameWinCondition() {
    signal input finalScore;
    signal output isWinner;

    component isLess = LessThan(16); // 16-bit comparator
    isLess.in[0] <== finalScore;
    isLess.in[1] <== 1000;  // Threshold

    isWinner <== 1 - isLess.out; // Flip the result
}

component main = GameWinCondition();
