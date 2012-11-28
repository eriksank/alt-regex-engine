Alternative Regular Expression Compilation Engine
=================================================

Introduction
------------
In order to execute a regular expression, it needs to be compiled into a set of state-transitions. For example, let us investigate the following regular expression:

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




