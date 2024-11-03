self.onmessage = function(event) {
    const file = event.data.file;
    const chunkSize = 1024 * 512; // 512KB chunk size
    let content = "";
    let offset = 0;
    const reader = new FileReader();

    reader.onload = function(e) {
        content += e.target.result;

        // Check if there's more to read
        offset += chunkSize;
        if (offset < file.size) {
            // Read the next chunk
            reader.readAsText(file.slice(offset, offset + chunkSize));
        } else {
            // Once all chunks are read, split content into formulas and send to main thread
            const latexList = content.split('\n').filter(line => line.trim() !== '');
            self.postMessage({ latexList });
        }
    };

    // Start reading the first chunk
    reader.readAsText(file.slice(0, chunkSize));
};
