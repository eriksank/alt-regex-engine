/**
	Regex Parser
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

        This function walks step by step through a regular expression with a text to match

*/

function altRegexWalker(transitions)
{
        this.FAIL=-1;
        this.transitions=transitions;
        this.position=-1;
        this.state=0;
        this.buffer='';

        this.setMatchText=function(text)
        {
                this.position=-1;
                this.state=0;
                this.text=text;
                this.buffer='';
        }

        this.EOF=function()
        {
                return this.position>=this.text.length;
        }

        this.next=function()
        {
                this.position++;

                if(this.EOF())
                {
                        return this.FAIL;
                }

                var char=this.text[this.position];
                var key=this.state+'.'+char;
                if(transitions[key])
                {
                        this.buffer+=char;
                        var transition=transitions[key];
                        this.state=transition.to;
                        return this.state.final;
                }
                else
                {
                        return this.FAIL;
                }
        }

        this.match=function(text)
        {
                this.setMatchText(text);
                while(!this.EOF() && this.next()==this.FAIL);
                while(!this.EOF() && this.next()!=this.FAIL);
                return this.buffer;
        }
}

module.exports=altRegexWalker;

