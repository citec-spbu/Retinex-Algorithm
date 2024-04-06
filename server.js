const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "src" directory
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'LOLdataset')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
