import axios from 'axios';

// Определение базового URL API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const authHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token }
    } else {
        return {};
    }
}

export const doLogin = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`,
            {
                email: email,
                password: password
            },
            { headers: authHeader() }
        );

        localStorage.setItem("user", JSON.stringify(response.data));
        return { success: true, data: "You successfully logged in!" };

    } catch (error) {
        return { success: false, data: error };
    }
}

export const doRegister = async (email, password, username) => {
    try {
        await axios.post(`${API_URL}/register`,
            {
                email: email,
                password: password,
                username: username
            },
            { headers: authHeader() }
        )

        return { success: true, data: "You successfully registered!" };

    } catch (error) {
        return { success: false, data: error };
    }
}

export const editMovie = async (movie) => {
    try {
        const formData = new FormData();
        formData.append('title', movie.title);
        formData.append('price', movie.price);
        formData.append('content', movie.content);
        formData.append('categoryId', movie.categoryId);
        if (movie.photo && typeof movie.photo !== 'string') {
            formData.append('photo', movie.photo);
        }

        const response = await axios.put(`${API_URL}/movies/${movie._id}/edit`,
            formData,
            {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        return { success: true, data: response.data };

    } catch (error) {
        console.error('Ошибка при редактировании фильма:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "У вас нет прав для редактирования этого фильма" };
            } else if (error.response.status === 404) {
                return { success: false, message: "Фильм не найден" };
            } else {
                return { success: false, message: error.response.data.error || "Ошибка обновления фильма" };
            }
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const deleteMovie = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/movies/delete/${id}`,
            {
                headers: authHeader()
            }
        );

        return { success: true, data: response.data };

    } catch (error) {
        console.error('Ошибка при удалении фильма:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "У вас нет прав для удаления этого фильма" };
            } else if (error.response.status === 404) {
                return { success: false, message: "Фильм не найден" };
            } else {
                return { success: false, message: error.response.data.error || "Ошибка удаления фильма" };
            }
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const setMovie = async (title, price, content, categoryId, photo) => {
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('price', price);
        formData.append('content', content);
        formData.append('categoryId', categoryId);
        if (photo) {
        formData.append('photo', photo);
        }

        const response = await axios.post(`${API_URL}/movies/create`,
            formData,
            {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        return { success: true, data: response.data };

    } catch (error) {
        console.error('Ошибка при создании фильма:', error);
        if (error.response) {
            return { 
                success: false, 
                message: error.response.data.error || error.response.data.message || "Ошибка создания фильма" 
            };
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const getAllMovies = async () => {
    try {
        const response = await axios.get(`${API_URL}/movies`);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response.data.error };
    }
}

export const getOneMovie = async (movieId) => {
    try {
        const response = await axios.get(`${API_URL}/movies/${movieId}`,
            { headers: authHeader() }
        )
        return { success: true, data: response.data };

    } catch (error) {
        return { success: false, data: error.response.data.error };
    }
}

export const getAllCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/categories`);
        // Преобразуем id в _id для совместимости с остальным кодом
        if (Array.isArray(response.data)) {
            return response.data.map(category => {
                if (category.id && !category._id) {
                    return { ...category, _id: category.id };
                }
                return category;
            });
        }
    return response.data;
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
        return [];
    }
}

export const getCategoryMovies = async (catId) => {
    try {
        const response = await axios.get(`${API_URL}/movies/category/${catId}`,
            { headers: authHeader() }
        )
        return { success: true, data: response.data };

    } catch (error) {
        return { success: false, data: error.response.data.error };
    }
}

export const getMyMovies = async () => {
    try {
        const response = await axios.get(`${API_URL}/privateMovies`,
            { headers: authHeader() }
        )
        return { success: true, data: response.data };

    } catch (error) {
        return { success: false, data: "Error" };
    }
}

export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`)
        return { success: true, data: response.data };

    } catch (error) {
        return { success: false, data: error.response.data.error };
    }
}

export const getProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/profile`, { headers: authHeader() });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response ? error.response.data : error.message };
    }
}

export const setCategory = async (name) => {
    try {
        const response = await axios.post(`${API_URL}/categories/create`, 
            { name }, 
            { headers: authHeader() }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Ошибка при создании категории:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "Только администратор может создавать категории" };
            } else {
                return { success: false, message: error.response.data.error || "Ошибка создания категории" };
            }
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const deleteCategory = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/categories/delete/${id}`, { headers: authHeader() });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "Только администратор может удалять категории" };
            } else if (error.response.status === 404) {
                return { success: false, message: "Категория не найдена" };
            } else {
                return { success: false, message: error.response.data.error || "Ошибка удаления категории" };
            }
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const editCategory = async (category) => {
    try {
        const response = await axios.put(`${API_URL}/categories/${category._id}/edit`, 
            { name: category.name }, 
            { headers: authHeader() }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Ошибка при редактировании категории:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "Только администратор может редактировать категории" };
            } else if (error.response.status === 404) {
                return { success: false, message: "Категория не найдена" };
            } else {
                return { success: false, message: error.response.data.error || "Ошибка обновления категории" };
            }
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const getOneCategory = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/categories/${id}`, { headers: authHeader() });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Ошибка при получении категории:', error);
        if (error.response && error.response.status === 404) {
            return { success: false, message: "Категория не найдена" };
        }
        return { success: false, message: "Ошибка получения данных" };
    }
}

export const getAllUsersAdmin = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin/users`, { headers: authHeader() });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response.data.error };
    }
}

export const editUser = async (user) => {
    try {
        const response = await axios.put(`${API_URL}/admin/users/${user._id}/edit`, 
            {
                email: user.email,
                username: user.username,
                role: user.role,
                password: user.password
            }, 
            { headers: authHeader() }
        );
        return { success: true, data: response.data.message };
    } catch (error) {
        console.error('Ошибка при редактировании пользователя:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "У вас нет прав для редактирования пользователей" };
            } else if (error.response.status === 404) {
                return { success: false, message: "Пользователь не найден" };
            } else {
                return { success: false, message: error.response.data.error || "Ошибка обновления пользователя" };
            }
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/admin/users/${id}/delete`, 
            { headers: authHeader() }
        );
        return { success: true, data: response.data.message };
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "У вас нет прав для удаления пользователей" };
            } else if (error.response.status === 404) {
                return { success: false, message: "Пользователь не найден" };
            } else {
                return { success: false, message: error.response.data.error || "Ошибка удаления пользователя" };
            }
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const getOneUser = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/admin/users/${userId}`, 
        { 
            headers: authHeader() 
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response.data };
    }
}

export const addFavoriteMovie = async (movieId) => {
    try {
        const response = await axios.post(`${API_URL}/favoriteMovies`,
            { movieId },
            { headers: authHeader() }
        );

        return { success: true, data: response.data.message || "Фильм добавлен в избранное" };

    } catch (error) {
        console.error('Ошибка при добавлении фильма в избранное:', error);
        if (error.response) {
            if (error.response.status === 400 && error.response.data.message === "Movie is already in favorites") {
                return { success: false, message: "Фильм уже в избранном" };
            }
            return { 
                success: false, 
                message: error.response.data.error || "Ошибка добавления фильма в избранное" 
            };
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const removeFavoriteMovie = async (movieId) => {
    try {
        const response = await axios.delete(`${API_URL}/favoriteMovies/${movieId}`,
            { headers: authHeader() }
        );

        return { success: true, data: response.data.message || "Фильм удален из избранного" };

    } catch (error) {
        console.error('Ошибка при удалении фильма из избранного:', error);
        if (error.response) {
            return { 
                success: false, 
                message: error.response.data.error || "Ошибка удаления фильма из избранного" 
            };
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const getFavoriteMovies = async () => {
    try {
        const response = await axios.get(`${API_URL}/favoriteMovies`, { headers: authHeader() });
        // Преобразуем id в _id для совместимости с остальным кодом
        if (Array.isArray(response.data)) {
            response.data = response.data.map(movie => {
                if (movie.id && !movie._id) {
                    return { ...movie, _id: movie.id };
                }
                return movie;
            });
        }
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Ошибка при получении избранных фильмов:', error);
        if (error.response) {
            return { success: false, message: error.response.data.error || "Ошибка загрузки избранных фильмов" };
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const getUserStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/user-stats`, { headers: authHeader() });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Ошибка при получении статистики пользователя:', error);
        if (error.response) {
            return { success: false, message: error.response.data.message || "Ошибка получения статистики" };
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}

export const getAdminStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin-stats`, { headers: authHeader() });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Ошибка при получении административной статистики:', error);
        if (error.response) {
            if (error.response.status === 403) {
                return { success: false, message: "У вас нет прав для просмотра этой статистики" };
            }
            return { success: false, message: error.response.data.message || "Ошибка получения статистики" };
        }
        return { success: false, message: "Ошибка соединения с сервером" };
    }
}








