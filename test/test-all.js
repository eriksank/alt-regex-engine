#!/usr/bin/env node
/*
	Alternative Regular Expression Engine
	Written by Erik Poupaert, November 2012
	Licensed under the Library General Public License (LGPL).

*/
scripts=[
      'compiling'
    , 'walking'
]

for(var i=0; i<scripts.length; i++)
    require('./test-'+scripts[i]+'.js');

