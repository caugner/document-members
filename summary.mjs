import { spawnSync } from "child_process";

const branches = ["chrome", "firefox", "safari"];

function run(command, args) {
  const {
    output: [stderr, stdout],
  } = spawnSync(command, args, { encoding: "utf8" });

  if (stderr) {
    throw Error(stderr);
  }

  return stdout.trim();
}

const FILE = "result.txt";

function addSupport(target, isSupported, userAgent) {
  const current = target.at(-1);
  const isPrevSupported =
    typeof current === "object" &&
    typeof current.version_removed === "undefined";

  if (isSupported === isPrevSupported) {
    return;
  }

  if (isSupported) {
    target.push({
      version_added: userAgent,
    });
  } else {
    current.version_removed = userAgent;
  }
}

function findPartSuffix(haystack, needle) {
  return haystack
    .split(" ")
    .find((part) => part.startsWith(needle))
    .substring(needle.length);
}

function toVersion(userAgent) {
  if (userAgent.includes("Chrome/")) {
    const chromeVersion = findPartSuffix(userAgent, "Chrome/");
    return chromeVersion.split(".").at(0);
  } else if (userAgent.includes("AppleWebKit")) {
    if (userAgent.includes("Safari/100")) {
      return "1";
    } else if (userAgent.includes("Safari/412")) {
      return "2";
    } else if (userAgent.includes("Version/")) {
      const safariVersion = findPartSuffix(userAgent, "Version/");
      const [major, minor] = safariVersion.split(".", 3);
      if (minor === "0") {
        return major;
      } else {
        return `${major}.${minor}`;
      }
    } else {
      throw Error("Unsupported Safari version: " + userAgent);
    }
  } else if (userAgent.includes("Firefox/")) {
    const firefoxVersion = findPartSuffix(userAgent, "Firefox/");
    const [major, minor] = firefoxVersion.split(".", 3);
    if (minor === "0") {
      return major;
    } else {
      return `${major}.${minor}`;
    }
  } else {
    throw Error("Unsupported user agent: " + userAgent);
  }
}

for (const branch of branches) {
  const commits = run("git", ["log", "--oneline", "--reverse", branch, FILE])
    .split("\n")
    .map((line) => line.split(" ", 2).shift())
    .filter(Boolean);

  const status = {};
  const result = {};
  for (const commit of commits) {
    const content = run("git", ["show", `${commit}:${FILE}`]);

    const [userAgent, ...lines] = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      continue;
    }

    const version = toVersion(userAgent);

    for (const line of lines) {
      const [[html, svg, xml], name] = line.split(" ", 2);
      result[name] ??= {
        html: [],
        svg: [],
        xml: [],
      };
      status[name] ??= {
        html: false,
        svg: false,
        xml: false,
      };

      addSupport(result[name].html, fromBit(html), version);
      addSupport(result[name].svg, fromBit(svg), version);
      addSupport(result[name].xml, fromBit(xml), version);

      status[name].html = fromBit(html);
      status[name].svg = fromBit(svg);
      status[name].xml = fromBit(xml);
    }
  }

  console.log(`## ${branch}`);
  console.log("");
  console.log("| Member | HTML | SVG | XML |");
  console.log("|--------|:----:|:---:|:---:|");
  for (const [key, value] of Object.entries(result)) {
    console.log(
      `| \`${key}\` | ${formatEntries(value.html)} | ${formatEntries(value.svg, value.html)} | ${formatEntries(value.xml, value.html)} |`,
    );
  }
  console.log("");
}

function fromBit(bit) {
  return Boolean(Number(bit));
}

function formatEntries(entries, reference) {
  if (JSON.stringify(entries) === JSON.stringify(reference)) {
    return "=";
  } else if (entries.length === 0) {
    return "–";
  }

  return entries
    .map((entry) => {
      if (entry.version_removed) {
        return `${entry.version_added}–${entry.version_removed}`;
      } else {
        return `${entry.version_added}`;
      }
    })
    .join(", ");
}
