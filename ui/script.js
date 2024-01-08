const rootPath = "/Users/stephenpeterkins/tmp/fili"
const { writeTextFile, readTextFile, readDir } = window.__TAURI__.fs;

let currentState = {
    filePath: null, // Path of the currently open file
    content: '' // Content of the currently open file
};

function generateRandomFileName() {
    //const timeStamp = new Date().toISOString().replace(/[:.-]/g, '');
    const randomString = Math.random().toString(36).substring(2, 7); // Generates a 5-character random string
    return `untitled_${randomString}.txt`;
}

async function createNewFile() {
    currentState.filePath = null;
    updateContent('');

    try {
        const defaultFileName = generateRandomFileName();
        const filePath = `${rootPath}/${defaultFileName}`

        await window.__TAURI__.fs.writeFile({
            path: filePath,
            contents: currentState.content
        });

        currentState.filePath = filePath;
        loadFiles()
    } catch (error) {
        console.error('Error opening save dialog:', error);
    }
}

function updateContent(newContent) {
    currentState.content = newContent;
    document.getElementById("textArea").value = newContent;
}

async function loadFiles() {
    try {
        const files = await readDir(rootPath);
        const fileList = document.getElementById("fileList");
        fileList.innerHTML = ''; // Clear existing list
        files.forEach(file => {
            if (file.children === undefined) { // Filter to include only files
                const li = document.createElement('li');
                li.textContent = file.name;
                li.onclick = () => openFile(`${rootPath}/${file.name}`);
                fileList.appendChild(li);
            }
        });
    } catch (error) {
        console.error('Error reading directory:', error);
    }
}

async function openFile(filePath) {
    try {
        const contents = await readTextFile(filePath);
        currentState.filePath = filePath;
        updateContent(contents);
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}

// Modify the save function to use the current state
async function saveFile() {
    if (currentState.filePath) {
        try {
            await writeTextFile(currentState.filePath, currentState.content);
            alert('File saved successfully!');
        } catch (error) {
            console.error('Error saving the file:', error);
        }
    } else {
        // Handle the case where there is no file path (e.g., new file)
        // Possibly open a save dialog or ask the user for a file name
    }
}

document.getElementById("saveButton").addEventListener("click", saveFile);

document.getElementById("newFileButton").addEventListener("click", createNewFile);


//document.getElementById("saveButton").addEventListener("click", async () => {
    //const text = document.getElementById("textArea").value;
    //try {
        //// Replace 'path/to/file.txt' with the desired file path
        //await writeFile({ path: `${rootPath}/file.txt`, contents: text });
        //alert('File saved successfully!');
    //} catch (error) {
        //console.error('Error saving the file:', error);
    //}
//});

// Attach an event listener to the textarea to update the content state as the user types
document.getElementById("textArea").addEventListener("input", (event) => {
    currentState.content = event.target.value;
});

loadFiles();
