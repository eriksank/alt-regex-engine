Alternative Regular Expression Engine
=====================================

NodeJS javascript library with an alternative compilation method for regular expressions.

Installation
------------

alt-regex-engine can be installed for [Node](http://nodejs.org) using [`npm`](http://github.com/isaacs/npm/).

Using npm:

    npm install alt-regex-engine


Introduction
------------

In order to execute a regular expression, the expression needs to be compiled into a set of state-transitions. For example, let us investigate the following regular expression:

        a b c d

Each time after receiving a character, the regular expression walker will move to a new state, expecting a new character:

        [0] a [1] b [2] c [3] d [4]F

The initial state for the walker is `state [0]`. According the our example regular expression, in state zero, it expects the character `a`. After receiving character `a`, the walker proceeds to `state [1]`. If the walker receives any other character in `state [0]`, it will not walk to `state [1]` but terminate with a `FAIL`. The walker will keep walking until he reaches the final `state [4]F` and return `SUCCESS` in that stage.

In table format, the walker keeps querying the following table:

<table>
        <tr>
                <td>state/from</td>
                <td>character</td>
                <td>state/to</td>
                <td>final</td>
        </tr>

        <tr>
                <td>0</td>
                <td>a</td>
                <td>1</td>
                <td></td>
        </tr>

        <tr>
                <td>1</td>
                <td>b</td>
                <td>2</td>
                <td></td>
        </tr>

        <tr>
                <td>2</td>
                <td>c</td>
                <td>3</td>
                <td></td>
        </tr>

        <tr>
                <td>3</td>
                <td>d</td>
                <td>4</td>
                <td>F</td>
        </tr>
</table>

In JSON format, the table looks like this:

        {"from":0,"char":"a","to":1,"final":false}
        {"from":1,"char":"b","to":2,"final":false}
        {"from":2,"char":"c","to":3,"final":false}
        {"from":3,"char":"d","to":4,"final":true}

Such state-transition table is traditionally also called a **DFA**, a [Deterministic Finite Automaton](http://en.wikipedia.org/wiki/Deterministic_finite_automaton). It is called **deterministic** because there is no confusion possible for the walker if he knows his current state and he knows what character he received. There will be only one new state to go to.

In other words, the function `newState(currentState,character)` returns a single state number for a DFA and not an array of them. When the function `newState` could return an array instead of a single number, it is not a DFA but an [NFA](http://en.wikipedia.org/wiki/Nondeterministic_finite_automata).


Kleene operators
----------------

In his work throughout the 1950s, [Stephen Kleene](http://en.wikipedia.org/wiki/Stephen_Kleene) introduced his concept of regular language operators. 

_Note: Let's represent nothing by something: Traditionally, we represent nothing by `ε`. It stands for: nothing at all. So, yes, it is a bit paradoxical that we need something to represent nothing._

###Kleene Star: zero or more repetitions of a pattern
<table>
        <tr>
                <td>
                        (ab)*
                </td>        
                <td>
                        ε
                        ab
                        abab
                        ababab
                        abababab ...
                </td>
        </tr>
</table>

###Kleene Plus: One or more repetitions of a pattern

<table>
        <tr>
                <td>
                        (ab)+
                </td>
                <td>
                        ab
                        abab
                        ababab
                        abababab ...
                </td>
        </tr>
</table>

###Kleene Option: Zero or one times the pattern

<table>
        <tr>
                <td>
                        (ab)?
                </td>
                <td>
                        ε
                        ab
                </td>
        </tr>
</table>

###Kleene OR: One pattern or an other

<table>
        <tr>
                <td>
                        (ab|cd)
                </td>
                <td>
                        ab
                        cd
                </td>
        </tr>
</table>

        ab|cd
                ab
                cd

State transitions in the presence of Kleene operators
-----------------------------------------------------

Let us investigate the following regular expression:

        r(ab)*c

The state decoration rules are the following:

- in front of each character we add another state
- at the end of the regular expression, we add the final state

Therefore, the decorated expression becomes:

        [0] r( [1] a [2] b)* [3] c [4]F

According the Kleene expansion rule, the expression contains the following transitions:

        0: [0] r [3] c [4]F
        1: [0] r [1] a [2] b [1] a [2] b [3] c [4]F
        2: [0] r [1] a [2] b [1] a [2] b [3] [1] a [2] b [3] c [4]F
        3: [0] r [1] a [2] b [1] a [2] b [3] [1] a [2] b [3] [1] a [2] b [3]c [4]F
        ...

If you look carefully at the expanded expressions, you will notice that no new transitions have been introduced during repetition `3` (or `4` or `5` if you enumerate them too). All possible transitions in a Kleene Star are fully contained in repetitions `0`,`1`, and `2`.

It is this property that allows for a simplification of [Glushkov's algorithm](http://personales.dcc.uchile.cl/~gnavarro/ps/algor04.2.pdf).

In general terms, we can state that the following reduction rules apply to Kleene operators:

        (ab)*   ε  ab  abab
        (ab)+      ab  abab
        (ab)?   ε  ab 

We can compute the transitions in an expression containing a Kleene operator by computing the transitions its reduced rules.

For the example, computing the transitions in:

        [0] r( [1] a [2] b)* [3] c [4]F

amounts to computing the transitions in:

        [0] r [3] c [4]F
        [0] r [1] a [2] b [1] a [2] b [3] c [4]F
        [0] r [1] a [2] b [1] a [2] b [3] [1] a [2] b [3] c [4]F

It is equivalent.

The program in Javascript for NodeJS is a practical demonstration for the statement that we can compute Kleene's closure by applying systematically the reduction rules mentioned above. Using the simple technique demonstrated in the first example, you can derive manually the following transitions:

        {"from":2,"char":"b","to":3,"final":false}
        {"from":2,"char":"b","to":1,"final":false}
        {"from":0,"char":"r","to":3,"final":false}
        {"from":0,"char":"r","to":1,"final":false}
        {"from":1,"char":"a","to":2,"final":false}
        {"from":3,"char":"c","to":4,"final":true}

The result is an NFA. Using a simple disambiguation technique (see below), you can from there derive the DFA:

        {"from":2,"char":"b","to":5,"final":false}
        {"from":0,"char":"r","to":5,"final":false}
        {"from":1,"char":"a","to":2,"final":false}
        {"from":3,"char":"c","to":4,"final":true}
        {"from":5,"char":"c","to":4,"final":true}
        {"from":5,"char":"a","to":2,"final":false}


Compilation steps
-----------------

###lexer

The lexer is a simple program that accepts a regular expression as input and returns a set of tokens as output. The tokens are either a state or a character. For example:

        r(ab)*c

becomes:

        [0]  r  (  [1]  a  [2]  b  )  *  [3]  c  [4]F

###parser

The parser removes all subexpressions in brackets from the expression or its subexpressions and replaces them by an expression token. For example:

        [0]  r  (  [1]  a  [2]  b  )  *  [3]  c  [4]F

becomes:

        [0]  r  exp1  *  [3]  c  [4]F 

With the collection of stored expressions:

        1: [1]  a  [2]  b

The parser does this recursively. For example:

        r(t(ab)*y)

becomes:

        [0]  r  (  [1]  t  (  [2]  a  [3]  b  )  *  [4]  y  )  [5]F 

And after parsing:

        [0]  r  exp2  [5]F 

With the collection of stored expressions:

        1: [2]  a  [3]  b 
        2: [1]  t  exp1  *  [4]  y 

###flattener

The main algorithm to compute the NFA is the `flattener`. It works as following. It takes as input the parsed expression. From there, it looks for Kleene operators. If it finds one, it reduces the operator using the reduction rules and stores the new expressions in a queue; and starts processing the queue again. If it cannot find operators in a queued expression, it brings back the subexpressions it finds and puts the expression back in the queue. The flattener keeps processing the queue until no operators nor expressions can be found in an expression. Then, it is ready to leave the queue and joined the flattened expressions.

Contrary to [Thompson's classical algorithm](http://www.fing.edu.uy/inco/cursos/intropln/material/p419-thompson.pdf), my algorithm does not use a stack but a queue. I do not know, however, without further investigation whether it is actually faster than the [Thompson-McNaughton-Yamada approach](http://hackingoff.com/compilers/regular-expression-to-nfa-dfa).

For the example:

        r(t(ab)*y)

The flattened expressions look like this:

        [0]  r  [1]  t  [2]  a  [3]  b  [4]  y  [5]F 
        [0]  r  [1]  t  [4]  y  [5]F 
        [0]  r  [1]  t  [2]  a  [3]  b  [2]  a  [3]  b  [4]  y  [5]F 

###transition deriver

The `transition deriver` will just go through each flattened expression and produce the transitions. For example:

        ... [1]  t  [2] ...

yields the transition:

        **state/from**: 1
        **character**: t 
        **state/to**: 2

For the example:

        r(t(ab)*y)

The NFA transitions look like this:

        {"from":2,"char":"a","to":3,"final":false}
        {"from":4,"char":"y","to":5,"final":true}
        {"from":3,"char":"b","to":4,"final":false}
        {"from":3,"char":"b","to":2,"final":false}
        {"from":1,"char":"t","to":4,"final":false}
        {"from":0,"char":"r","to":1,"final":false}
        {"from":1,"char":"t","to":2,"final":false}

###transition compressor

In order to prepare the disambiguation of the NFA into a DFA, the `transition compressor` will create one record per combination of `from/char`:

        {"from":2,"char":"a","to":[{"to":3,"final":false}]}
        {"from":4,"char":"y","to":[{"to":5,"final":true}]}
        {"from":3,"char":"b","to":[{"to":4,"final":false},{"to":2,"final":false}]}
        {"from":1,"char":"t","to":[{"to":4,"final":false},{"to":2,"final":false}]}
        {"from":0,"char":"r","to":[{"to":1,"final":false}]}


###transition disambiguator

The example contains two ambiguous transitions. For example, the following transition:

        {"from":3,"char":"b","to":[{"to":4,"final":false},{"to":2,"final":false}]}

indicates two different states, `state [4]` and `state [2]` that can be reached by the walker when he sees a char `b` in `state [3]`. Therefore, the walker will reach a combined `state [6]`, which is the combination of both `state [2]` and `state [4]`.

The disambiguator will replace the transition by:

        {"from":3,"char":"b","to":[{"to":6,"final":false,"combined":true}]}

Since neither `state [4]` nor `state [2]` are final states, the new state is not final either. All transitions departing from either `state [2]` or `state [4]` will depart from `state [6]` too. Therefore, the disambiguator creates the following new transitions out form `state [6]`:

        {"from":6,"char":"y","to":[{"to":5,"final":true}],"fromIsNewState":true,"combination":[2,4]}
        {"from":6,"char":"a","to":[{"to":3,"final":false}],"fromIsNewState":true,"combination":[2,4]}

After disambiguating all ambiguous transitions, we end with the following disambiguated transitions:

        {"from":2,"char":"a","to":[{"to":3,"final":false}]}
        {"from":4,"char":"y","to":[{"to":5,"final":true}]}
        {"from":3,"char":"b","to":[{"to":6,"final":false,"combined":true}]}
        {"from":1,"char":"t","to":[{"to":6,"final":false,"combined":true}]}
        {"from":0,"char":"r","to":[{"to":1,"final":false}]}
        {"from":6,"char":"y","to":[{"to":5,"final":true}],"fromIsNewState":true,"combination":[2,4]}
        {"from":6,"char":"a","to":[{"to":3,"final":false}],"fromIsNewState":true,"combination":[2,4]}

###purger

The `purger` simply removes the transition fields that were only needed for disambiguation and are no longer needed any further:

        {"from":2,"char":"a","to":3,"final":false}
        {"from":4,"char":"y","to":5,"final":true}
        {"from":3,"char":"b","to":6,"final":false}
        {"from":1,"char":"t","to":6,"final":false}
        {"from":0,"char":"r","to":1,"final":false}
        {"from":6,"char":"y","to":5,"final":true}
        {"from":6,"char":"a","to":3,"final":false}

The purger yields the final DFA.


Using the transitions to match
------------------------------

In the test folder for the demonstration library, you can find a simplistic walker implementation that matches a regular expression pattern to a given text:

        $ ./test-walking.js 
        pattern: (ax)*b
        text: ztaxaxbc        match: axaxb
        text: ewrwere         match: 
        text: axb             match: axb
        text: b               match: b
        text: trbtr           match: b
        text:                 match: 

Performance
-----------

It is probably a bit naive to state that the compilation time increases with the size of the regular expression pattern. This is not really true. Performance degrades expecially with the complexity of the expressions. The more Kleene operators -- embedded in subexpressions or not -- the larger the number of flattened expressions to compute. I do not think that this is a property tied to this algorithm. It is tied to the fact that the more operators there can be found in the expression, the more transitions there will be to derive.


License
-------
	Copyright (c) 2012 Erik Poupaert.
	Licensed under the Library General Public License (LGPL).

