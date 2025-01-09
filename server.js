const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const { execSync } = require("child_process");

const PORT = 3000;
const FILE_PATH = "result.txt";

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  if (req.method === "GET" && parsedUrl.pathname === "/") {
    // Serve the form
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <h1>Submit Text</h1>
  <form id="form" method="POST" action="">
    <input id="userAgent" type="text" name="userAgent" size="100" readonly />
    <br>
    <label for="payload">Result:</label>
    <br>
    <textarea id="payload" name="payload" cols="100" rows="40" readonly required></textarea>
    <br>
    <button type="submit">Submit</button>
  </form>
  <script>
  var members = ["URL","activeElement","adoptNode","adoptedStyleSheets","alinkColor","all","anchors","append","applets","bgColor","body","captureEvents","caretPositionFromPoint","caretRangeFromPoint","characterSet","childElementCount","children","clear","close","compatMode","contentType","cookie","createAttribute","createAttributeNS","createCDATASection","createComment","createDocumentFragment","createElement","createElementNS","createEntityReference","createEvent","createExpression","createNSResolver","createNodeIterator","createProcessingInstruction","createRange","createTextNode","createTouch","createTouchList","createTreeWalker","currentScript","defaultView","designMode","dir","doctype","documentElement","documentURI","documentURIObject","domain","elementFromPoint","elementsFromPoint","embeds","enableStyleSheetsForSet","evaluate","execCommand","execCommandShowHelp","exitFullscreen","exitPictureInPicture","exitPointerLock","featurePolicy","fgColor","fileSize","firstElementChild","fonts","forms","fragmentDirective","fullscreen","fullscreenElement","fullscreenEnabled","getAnimations","getBoxObjectFor","getElementById","getElementsByClassName","getElementsByName","getElementsByTagName","getElementsByTagNameNS","getSelection","hasFocus","hasStorageAccess","head","height","hidden","images","implementation","importNode","lastElementChild","lastModified","lastStyleSheetSet","linkColor","links","loadOverlay","location","mozSetImageElement","mozSyntheticDocument","normalizeDocument","onafterscriptexecute","onbeforescriptexecute","oncopy","oncut","onfreeze","onfullscreenchange","onfullscreenerror","onpaste","onpointerlockchange","onpointerlockerror","onreadystatechange","onresume","onvisibilitychange","open","origin","pictureInPictureElement","pictureInPictureEnabled","plugins","pointerLockElement","popupNode","preferredStyleSheetSet","prepend","queryCommandEnabled","queryCommandIndeterm","queryCommandState","queryCommandSupported","queryCommandText","queryCommandValue","querySelector","querySelectorAll","readyState","referrer","registerElement","releaseCapture","releaseEvents","replaceChildren","requestStorageAccess","routeEvent","scripts","scrollingElement","selectedStyleSheetSet","styleSheetSets","styleSheets","timeline","title","tooltipNode","visibilityState","vlinkColor","wasDiscarded","width","write","writeln","xmlEncoding","xmlStandalone","xmlVersion"].sort();
  var htmlDoc = document;
  var svgDoc = document.implementation.createDocument("http://www.w3.org/2000/svg", "svg", null);
  var xmlDoc = document.implementation.createDocument("http://www.w3.org/2005/Atom", "feed", null);
  var lines = [];
  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    lines.push("" + (m in htmlDoc ? 1 : 0) + (m in svgDoc ? 1 : 0) + (m in xmlDoc ? 1 : 0) + " " + m);
  }
  var userAgent = window.navigator.userAgent;
  document.getElementById('userAgent').value = userAgent;
  document.getElementById('payload').value = userAgent + "\\n\\n" + lines.join("\\n");
  document.getElementById('form').submit();
  </script>
</body>
</html>`);
  } else if (req.method === "POST") {
    let body = "";

    // Collect data
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const parsedData = querystring.parse(body);
      const userAgent = parsedData.userAgent;
      const payload = parsedData.payload;

      if (payload) {
        // Save submission to file
        fs.writeFile(FILE_PATH, `${payload}\n`, (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            return res.end("Internal Server Error");
          }

          execSync(`git reset || true`, { encoding: "utf-8" });
          execSync(`git add ${FILE_PATH} || true`, { encoding: "utf-8" });
          execSync(`git commit -m "${userAgent}" || true`, {
            encoding: "utf-8",
          });

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Thank you for your submission!");
        });
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Bad Request: No text provided");
      }
    });
  } else {
    // Handle 404 Not Found
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
