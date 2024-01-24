import { createContext, useEffect, useState } from "react";

export const DataContext = createContext();

function DataProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [userProfile, setUserProfile] = useState({
    _id: "",
    fullName: "",
    image: "",
    phone:"",
    userName: "", 
  })

  const getPost = () => {
    fetch("http://localhost:4001/api/posts")
      .then((resp) => resp.json())
      .then((data) => setPosts(data));
  };

  return (
    <DataContext.Provider
      value={{
        posts,
        setPosts,
        getPost,
        userProfile,
        setUserProfile,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default DataProvider;
