/**
	Regex Transition Disambuigator
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function add new states until the transitions are deterministic

*/

function disambiguateTransitions(transitions)
{
        var engine=this;

        function max(a,b)
        {
                if(a>b) return a; 
                return b;
        }

        function maxStateNumber(transitions)
        {
                var state=0;
                for(var i in transitions)
                {
                        var transition=transitions[i];
                        state=max(state,transition.from);
                        for(var j in transitions.to)
                                state=max(state,transition.to[j].to);
                }
                return state;
        }
        
        function toStateList(transitionsTo)
        {
                var states=[];
                for(var i in transitionsTo)
                {
                        var transitionTo=transitionsTo[i];
                        states.push(transitionTo.to);
                }
                return states.sort();
        }

        function addNewTransitionsForFrom(state,fromCombinationList,from,transitions)
        {

                for(var key in transitions)
                {
                    var transition=transitions[key];

                    if(transitions.fromIsNewState) continue;

                    if(from.to==transition.from && transition.char!='')
                    {
                        var key=state+'.'+transition.char;
                        if(!transitions[key])
                            transitions[key]={'from':state,'char':transition.char,
                                    'to':transition.to,'fromIsNewState':true,'combination':fromCombinationList};
                    }
                }
        }

        function addNewTransitions(state,froms,transitions)
        {
                var fromCombinationList=toStateList(froms);
                for(var i in froms)
                        addNewTransitionsForFrom(state,fromCombinationList,froms[i],transitions);
        }

        function computeFinality(toStates)
        {
            var finalsTrue=0;
            var finalsFalse=0;
            for(var i in toStates)
            {
                var toState=toStates[i];
                if(toState.final) finalsTrue++;
                else finalsFalse++;
            }
            if(finalsTrue==0) return false;
            if(finalsFalse==0) return true;
            return 'partial';
        }

        function disAmbiguate(state,transitions)
        {
                for(var key in transitions)
                {
                        var transition=transitions[key];
                        if(transition.to.length>1)
                        {
                                var transitionTo=transition.to;
                                var stateKey=engine.uniqueKey(transition.to);
                                if(engine.newStates[stateKey])
                                {
                                        state=engine.newStates[stateKey];
                                        transition.to=[{'to':state,'final':computeFinality(transition.to),'combined':true}];
                                }
                                else
                                {
                                        state++;
                                        engine.newStates[stateKey]=state;
                                        transition.to=[{'to':state,'final':computeFinality(transition.to),'combined':true}];
                                        addNewTransitions(state,transitionTo,transitions);
                                }
                        }
                }
        }

        this.newStates={};
        var state=maxStateNumber(transitions)+1;
        disAmbiguate(state,transitions);

        return transitions;
}

module.exports=disambiguateTransitions;

