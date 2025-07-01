import { createBrowserRouter } from 'react-router-dom'

import {Login, Register, Classes, ClassDetail, NewClass, NotFound} from '../pages'

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/classes',
        element: <Classes />
    },
    {
        path: '/class/:id/*',
        element: <ClassDetail />
    },
    {
        path: '/class/add',
        element: <NewClass />
    },
    {
        path: '*',
        element: <NotFound />
    }
])

export default router;