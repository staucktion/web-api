import React from "react";
import FileUpload from "./components/FileUpload.tsx";
import Header from "./components/Header.tsx";

const App: React.FC = () => {
	return (
		<div>
			<Header />
			<FileUpload />
		</div>
	);
};

export default App;
