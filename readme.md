# AI listing analyser for AutoTrader
## How to use
### Prerequisites
- Node js installed.
- OpenRouter account + API key
### Unpacking the chrome extension
Run the following command in the directory labeled frontend
```
npm run build
```
This command packages the chrome extension into a folder called ```dist```.
***
In chrome go to the following URL: [chrome://extensions/](https://chrome://extensions/). </br>
Toggle developer mode (top right). </br>
Click the "Load unpacked" button and select the ```dist``` folder.
The extension should appear under "All extenstions".
***
Run the following command in the directory labeled backend
```
npm run dev
```
This command runs the backend server which communicates to a LLM (default LLM is openai/gpt-oss-20b:free). _The backend server must be running in order for the extention to function properly, feel free to host the backend (via render or any other hosting platform)._
***
_Add in a ```.env``` file in the ```/backend``` directory containing the following: </br> </br>
PORT=3000 (or any desired port) </br>
OPENROUTER_API_KEY=[**YOUR_OPENROUTER_API_KEY**]_</br> </br>
**The extension is now ready to use.**
## How it works
### Frontend
The UI is made using React + Vite (typescript). The content script searches for the car's properties in the listing via plain JS document querying. The results from the content script are then passed to the React UI for it to display to the user.
### Backend
The backend is made using Node and Express JS. It is essentially a RestAPI with one endpoint - which uses the OpenAI API to generate an insightful summary of the AutoTrader listing.

