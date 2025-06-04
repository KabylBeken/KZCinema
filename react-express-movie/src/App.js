import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import './css/style.css';

// Компоненты, которые всегда загружаются
import Navigation from './Navigation';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Page404 from './Page404';
import Footer from './Footer';

// Обычные импорты компонентов, которые не требуют ленивой загрузки
import Movies from './Movies';
import MovieItem from './MovieItem';
import CreateMovie from './CreateMovie';
import EditMovie from './EditMovie';
import DeleteMovie from './DeleteMovie';
import Profile from './Profile';
import FavoriteMovies from './FavoriteMovies';

// Ленивая загрузка для админских компонентов
const UsersList = React.lazy(() => import('./UsersList'));
const AddUser = React.lazy(() => import('./AddUser'));
const EditUser = React.lazy(() => import('./EditUser'));
const DeleteUser = React.lazy(() => import('./DeleteUser'));
const MoviesList = React.lazy(() => import('./MoviesList'));
const CategoriesList = React.lazy(() => import('./CategoriesList'));
const CreateCategory = React.lazy(() => import('./CreateCategory'));
const EditCategory = React.lazy(() => import('./EditCategory'));
const DeleteCategory = React.lazy(() => import('./DeleteCategory'));
const CategoryMovies = React.lazy(() => import('./CategoryMovies'));

// Компонент загрузки для Suspense
const LoadingFallback = () => (
    <div className="container text-center py-5">
        <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка компонента...</p>
    </div>
);

// Компонент для защиты маршрутов, требующих авторизации
const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
        return <Navigate to="/login" state={{ message: "Необходимо войти в систему" }} />;
    }
    return children;
};

// Компонент для маршрутов, доступных только администраторам
const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token || user.role !== 'admin') {
        return <Navigate to="/login" state={{ message: "Необходим доступ администратора" }} />;
    }
    return children;
};

export default function App() {

    const routes = createBrowserRouter([
        {
            path: "/",
            element: <Navigation />,
            errorElement: <Page404 />,
            children: [
                {
                    path: 'register',
                    element: <RegisterForm />
                },
                {
                    path: 'login',
                    element: <LoginForm />
                },
                {
                    path: 'movies',
                    element: <Movies />
                },
                {
                    path: '/',
                    element: <Movies />
                },
                {
                    path: 'movies/category/:catId?',
                    element: (
                        <Suspense fallback={<LoadingFallback />}>
                            <CategoryMovies />
                        </Suspense>
                    )
                },
                {
                    path: 'movies/:movieId?',
                    element: <MovieItem />
                },
                {
                    path: 'movies/create',
                    element: <ProtectedRoute><CreateMovie /></ProtectedRoute>
                },
                {
                    path: 'movies/:movieId/edit',
                    element: <ProtectedRoute><EditMovie /></ProtectedRoute>
                },
                {
                    path: 'movies/:movieId/delete',
                    element: <ProtectedRoute><DeleteMovie /></ProtectedRoute>
                },
                {
                    path: 'categories',
                    element: (
                        <Suspense fallback={<LoadingFallback />}>
                            <CategoriesList />
                        </Suspense>
                    )
                },
                {
                    path: 'categories/create',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <CreateCategory />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'categories/:categoryId/edit',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <EditCategory />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'categories/:categoryId/delete',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <DeleteCategory />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'profile',
                    element: <ProtectedRoute><Profile /></ProtectedRoute>
                },
                {
                    path: 'admin/users',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <UsersList />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'admin/users/add',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <AddUser />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'admin/users/:userId/edit',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <EditUser />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'admin/users/:userId/delete',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <DeleteUser />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'admin/movies',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <MoviesList />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'admin/categories',
                    element: (
                        <AdminRoute>
                            <Suspense fallback={<LoadingFallback />}>
                                <CategoriesList />
                            </Suspense>
                        </AdminRoute>
                    )
                },
                {
                    path: 'favoriteMovies',
                    element: <ProtectedRoute><FavoriteMovies /></ProtectedRoute>
                }
            ]
        }
    ]);

    return (
        <>
            <RouterProvider router={routes} />
            <Footer />
        </>
    );
}
