# Vayvora Edu SaaS Web Application

This project is the frontend for the Vayvora Education SaaS platform, providing a comprehensive learning and course management experience for students, educators, and employers.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Features

*   **User Authentication:** Secure login and signup for different roles (Student, Educator, Employer).
*   **Student Dashboard:** Personalized overview of learning progress, tasks, achievements, and recommendations.
*   **Course Browsing & Enrollment:** Students can explore and enroll in various courses.
*   **Initial Skill Assessment:** Helps personalize learning paths for students.
*   **Course Management (Educators):** Tools for educators to create, edit, and manage their courses and lessons.
*   **Responsive Design:** Optimized for various screen sizes.

## Technologies Used

*   React.js
*   React Router DOM
*   Tailwind CSS
*   Recharts (for data visualization)
*   Axios (for API communication)
*   Context API (for state management)

## Project Setup

To get the project up and running locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd edutech_saas_web
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project. You'll need to define your API base URL.
    ```
    REACT_APP_API_BASE_URL=http://localhost:5000/api
    ```
4.  **Run the application:**


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
