import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
  posts: {
    userId: number;
    id: number;
    title: string;
    body: string;
  }[];
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
}

const initialState : InitialState = {
  posts: [],
  currentPage: 1,
  itemsPerPage: 5,
  searchTerm: "",
};

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing items per page
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.itemsPerPage = 5;
      state.searchTerm = "";
    },
  },
});

export const { setPosts, setCurrentPage, setItemsPerPage, setSearchTerm, resetPagination } = postSlice.actions;

export default postSlice.reducer;
