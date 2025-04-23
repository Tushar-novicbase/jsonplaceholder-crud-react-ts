import { useEffect, useState } from "react";
import { getCrudPost, createCrudPost, deleteCrudPost, updateCrudPost } from "../../api/api-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Loading from "../../layout/loading";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { setPosts, setCurrentPage, setItemsPerPage, setSearchTerm } from "../../redux/slices/posts-slice";
import toast from "react-hot-toast";

// Define the validation schema
const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  body: yup.string().required("Body is required"),
});

const DashboardContainer = () => {
  const dispatch = useAppDispatch();
  const { posts, currentPage, itemsPerPage, searchTerm } = useAppSelector((state) => state.posts);
  const [editingPost, setEditingPost] = useState<{ id: number; title: string; body: string } | null>(null);

  const { data: postData, isLoading } = useQuery({
    queryKey: ["Posts"],
    queryFn: getCrudPost,
  });

  const createPostMutation = useMutation({
    mutationFn: createCrudPost,
    onSuccess: (newPost) => {
      const nextId = posts.length > 0 ? Math.max(...posts.map((post) => post.id)) + 1 : 101;
      const postWithId = { ...newPost, id: nextId };
      dispatch(setPosts([postWithId, ...posts]));
      toast.success("Post created successfully");
      reset();
    },
  });

  // update post
  const updatePostMutation = useMutation({
    mutationFn: updateCrudPost,
    onSuccess: (updatedPost) => {
      // Check if the post exists in our local posts array
      const existingPost = posts.find((post) => post.id === updatedPost.id);

      if (existingPost) {
        // If post exists in API, use the API response
        dispatch(setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))));
      } else {
        // If post doesn't exist in API, update our local state
        const updatedLocalPost = { ...updatedPost, id: editingPost?.id };
        dispatch(setPosts(posts.map((post) => (post.id === editingPost?.id ? updatedLocalPost : post))));
      }

      setEditingPost(null);
      reset();
      toast.success("Post updated successfully");
    },
    onError: (error, variables) => {
      // If API update fails, update locally with the new form data
      if (editingPost) {
        const updatedLocalPost = {
          id: editingPost.id,
          title: variables.title,
          body: variables.body,
          userId: 1,
        };
        dispatch(setPosts(posts.map((post) => (post.id === editingPost.id ? updatedLocalPost : post))));
        setEditingPost(null);
        reset();
        toast.success("Post updated locally");
      }
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deleteCrudPost,
    onSuccess: (_, deletedId) => {
      dispatch(setPosts(posts.filter((post) => post.id !== deletedId)));
      toast.success("Post deleted successfully");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<{ title: string; body: string }>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (postData) {
      dispatch(setPosts(postData));
    }
  }, [postData, dispatch]);

  if (isLoading) return <Loading />;

  const onSubmit = async (data: { title: string; body: string }) => {
    try {
      if (editingPost) {
        // Try to update through API first
        await updatePostMutation.mutateAsync({ ...data, id: editingPost.id });
      } else {
        await createPostMutation.mutateAsync(data);
      }
    } catch (error) {
      // No need to show error here as it's handled in the mutation
    }
  };

  const handleEdit = (post: { id: number; title: string; body: string }) => {
    setEditingPost(post);
    setValue("title", post.title);
    setValue("body", post.body);
  };

  const handleCancel = () => {
    setEditingPost(null);
    reset();
  };

  const handleDelete = (id: number) => {
    if (id) {
      // Check if the post being deleted is the same as the one being edited
      if (editingPost?.id === id) {
        handleCancel();
      }
      deletePostMutation.mutate(id);
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Generate page numbers to show (current page and one before/after)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage === 1) {
        pages.push(1, 2, 3);
      } else if (currentPage === totalPages) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setItemsPerPage(Number(e.target.value)));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchTerm(""));
  };

  return (
    <div>
      {/* form container */}
      <div className="login-container" style={{ height: "100%" }}>
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">{editingPost ? "Edit Post" : "Add Post"}</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <div className="input-container">
                <input {...register("title")} id="title" type="text" className="form-input" placeholder="Enter title" />
              </div>
              {errors.title && <p className="error-message">{errors.title.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="body" className="form-label">
                Body
              </label>
              <div className="input-container">
                <input {...register("body")} id="body" type="text" className="form-input" placeholder="Enter body" />
              </div>
              {errors.body && <p className="error-message">{errors.body.message}</p>}
            </div>

            <div className="button-group">
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? "Loading ..." : editingPost ? "Update Post" : "+ Add Post"}
              </button>
              {editingPost && (
                <button type="button" className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* table container */}
      <div className="table-container">
        {/* Search container */}
        <div className="search-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBlock: "20px" }}>
          <input 
            type="text" 
            placeholder="Search by title or body..." 
            value={searchTerm} 
            onChange={handleSearchChange} 
            className="search-input" 
          />
          <button 
            className="search-button" 
            onClick={handleClearSearch} 
            disabled={!searchTerm}
          >
            Clear
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th className="id-column">ID</th>
              <th className="title-column">Title</th>
              <th className="body-column">Body</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts?.map((post) => (
              <tr key={post.id}>
                <td className="id-column">{post.id}</td>
                <td className="title-column">{post.title}</td>
                <td className="body-column">{post.body}</td>
                <td className="actions-column">
                  <div className="actions">
                    <button onClick={() => handleEdit(post)}>Edit</button>
                    <button onClick={() => handleDelete(post.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-container" style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBlock: "20px"}}>
          <div className="items-per-page">
            <label htmlFor="itemsPerPage" style={{fontSize: "20px", color: "#fff"}}>Items per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="items-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="pagination-buttons">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
