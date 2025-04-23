import toast from "react-hot-toast";
import { axiosInstance } from "./middleware";

// get all posts
export const getCrudPost = async () => {
  try {
    const res = await axiosInstance.get("/posts");
    return res.data;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to fetch posts");
  }
};

// create a new post
export const createCrudPost = async (data: { title: string; body: string }) => {
  try {
    const response = await axiosInstance.post("/posts", {...data,userId: 1});
    return response.data;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to create post");
  }
};

// delete post
export const deleteCrudPost = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response.data;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to delete post");
  }
};

// update post
export const updateCrudPost = async (data: { id: number; title: string; body: string }) => {
  try {
    const response = await axiosInstance.put(`/posts/${data.id}`, {
      ...data,
      userId: 1,
    });
    return response.data;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to update post");
  }
};
