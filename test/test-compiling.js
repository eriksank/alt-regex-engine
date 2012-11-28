#!/usr/bin/env node

var patterns=[
        'k?|bla'
        ,'(ax)*b'
        ,'ab|cd|ef'
        ,'a+|r(fg)*'
        ,'a?|r(fg)*'
        ,'((cd)*k?)*r(xz)+'
        ,'((cd)*k?)*|ba'
        ,'((cd)*k?)*'
        ,'(cd)*k?|ba'
        ,'a(b|c)d'
        ,'(b|c)'
        ,''
        ,'()'
        ,'(a)'
        ,'abasdf'
        ,'((cd)*k?)*'
        ,'((cd)*k?)*r(xz)+|blabla'
        ,'(a)*(a)*(a)*(a)*(a)*(a)*'
        ,'(a)*(a)*'
        ,'a(b|c)d'
	,'ab|cd'
        ,'abcd'
];
var altRegexEngine=require('../lib/alt-regex-engine');
var engine=new altRegexEngine(true);
for(i in patterns)
{
        var pattern=patterns[i];
        var transitions=engine.compile(pattern);
}
