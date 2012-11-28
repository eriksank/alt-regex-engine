#!/usr/bin/env node
/*
	Alternative Regular Expression Engine
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

*/

var pattern='(ax)*b';

var altRegexEngine=require('../lib/alt-regex-engine');
var altRegexWalker=require('../lib/alt-regex-walker');

var engine=new altRegexEngine(false);
var transitions=engine.compile(pattern);
var walker=new altRegexWalker(transitions);

var util=require('util');

function align(s,width)
{
        var buffer=s;
        while(buffer.length<width)
                buffer+=' ';
        return buffer;
}

function testMatch(text)
{
        var result=walker.match(text);
        console.log(util.format('text: %s match: %s',align(text,15),result));
}

console.log('pattern: '+pattern);
testMatch('ztaxaxbc');
testMatch('ewrwere');
testMatch('axb');
testMatch('b');
testMatch('trbtr');
testMatch('');

