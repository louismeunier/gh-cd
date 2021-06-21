//checks if webpage is a repository
function isRepository() {
    const repoDiv = document.querySelector("body > div.application-main > div")
    try {
        const repoDivItemtype = repoDiv.attributes.getNamedItem("itemtype").value;
        if (
            repoDivItemtype === "http://schema.org/SoftwareSourceCode" 
        )   return true 
        else return false
    } catch {
        return false
    }
}

//adds the basic key bind for the extension to start
function addInitialKeyListener() {
    document.addEventListener("keydown", (e) => {
        if (e.metaKey && e.key === "/") {
            const event = new Event("cmd");
            document.dispatchEvent(event);
        }
        if (e.key === "Escape") {
            const event = new Event("exit");
            document.dispatchEvent(event);
        }
    })
}

//get branch name
function getCurrentBranch() {
    const elem = document.querySelector("#branch-select-menu > summary > span.css-truncate-target");
    alert(elem.innerHTML)
}

//handle cd
function cd(path) {
    const currentPath = location.pathname;
    const pathArray = currentPath.split("/");
    const repoPath = pathArray.slice(1,3).join("/");
    const currentBranch = document.querySelector("#branch-select-menu > summary > span.css-truncate-target").innerHTML;

    let newPath;
    switch (path) {
        case "/":
            newPath = `${repoPath}/tree/${currentBranch}`;
            location.pathname = newPath;
            return true;
        case ".." || "../":
            if (pathArray.length === 3 || pathArray[pathArray.length-2] === "tree") {
                return false;
            } else {
                newPath = pathArray.slice(0, pathArray.length-1).join("/");
                location.pathname = newPath;
                return true
            }
        default: 
            if (pathArray.indexOf("tree") == 3) {
                newPath = pathArray.join("/") + `/${path}`
            } else {
                newPath = pathArray.join("/") + `/tree/${currentBranch}/${path}`;
            }
            var url = location.origin + newPath;
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            if (http.status != 404) {  
                location.pathname = newPath
                return true;
            } else {
                return false;
            }
    }
}

window.onload = () => {
    if (!isRepository()) {
        return;
    }
    addInitialKeyListener();

    //list for meta + /
    document.addEventListener("cmd", async () => {
        //add the search bar
        const URL = chrome.runtime.getURL("html/cmd.html");
        const res = await fetch(URL);
        const html = await res.text();

        document.body.insertAdjacentHTML("beforeend", html);
        //focus and listen for key strokes
        const searchBar = document.getElementById("--extension-search-bar");
        searchBar.focus();
        searchBar.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const input = searchBar.value;
                const words = input.split(" ");
                if (words[0] === "cd") {
                    const path = words[1];
                    const changed = cd(path);
                    if (!changed) {
                        searchBar.style.backgroundColor = "red";
                        setTimeout(() => {
                            searchBar.style.backgroundColor = "";
                        }, 500)
                    }
                }
            }
        })
    })

    //listen for escape
    document.addEventListener("exit", () => {
        document.getElementById("--extension-search-wrapper").remove();
    })
}