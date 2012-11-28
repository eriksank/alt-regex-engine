/**
	Regex Transition Disambuigator
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function purges the transitions, returning just (from,char,to,final) per transition

*/

function purgeTransitions(transitions)
{
        var transitionsNew={};
        for(var key in transitions)
        {
            var transition=transitions[key];
            transitionsNew[key]={'from':transition.from,'char':transition.char,
                'to':transition.to[0].to, 'final': transition.to[0].final};
        }
        return transitionsNew;
}

module.exports=purgeTransitions;

