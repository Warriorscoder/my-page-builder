My App Builder
This is a custom Contentful App that serves as a drag-and-drop page layout builder. It's designed to be used in conjunction with a frontend application to dynamically render pages based on a JSON configuration.

The app's primary function is to enable editors to visually arrange components and save the component order and IDs in a JSON field.

🚀 Technical Stack
Frontend: React, Redux, Contentful App SDK, Native CSS Modules

Tooling: create-contentful-app CLI, contentful-cli

📦 Setup Instructions
Follow these steps to get the app running locally and installed in your Contentful space.

1. Clone the repository and install dependencies:

git clone <your-app-builder-repo-url>
cd <your-app-builder-project-name>
npm install

2. Create the App Definition:

The create-contentful-app CLI will guide you through this process. It's recommended to do this after creating your content model.

npm run create-app-definition

3. Run the development server:

This command will start a local server for your app and provide a URL that you can use to install it in Contentful.

npm start

4. Install the App in Contentful:

Once the dev server is running, navigate to your Contentful space.

Go to Apps > Manage Custom Apps.

Click "Install to space" and use the local URL provided by the npm start command.

5. Assign the App to a Content Type:

Go to Content model > Landing page.

Edit the layoutConfig field settings.

In the "Appearance" tab, select your custom app from the list of available editors.

⚙️ App Configuration
The app requires an installation parameter for the preview functionality (if implemented).

previewUrl: The base URL of your frontend application's deployment (e.g., https://my-app.vercel.app). This is configured once during the app's installation.

🤝 How to Use
Open an entry of the Landing page content type.

Click the layoutConfig field to open the custom app in fullscreen mode.

Drag components from the sidebar onto the canvas.

Reorder components by dragging them up or down on the canvas.

The layout will be automatically saved. To publish the changes, click the "Publish" button on the entry itself.
