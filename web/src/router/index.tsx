import { createBrowserRouter } from 'react-router-dom'

import {Login, Register, Classes, ClassDetail, NewClass, Profile, Invite, NotFound} from '../pages'
import {default as PublicLayout} from './PublicLayout'
import {default as ProtectedLayout} from './ProtectedLayout'

import {Testing} from '../pages'
import {StudentExamDetail} from "../components";

const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            }
        ]
    },
    {
        element: <ProtectedLayout />,
        children: [
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
                path: '/profile',
                element: <Profile />
            },

            {
                path: '/class/:id/exam/:examGroupId/doing',
                element: <StudentExamDetail />
            },

            {
                path: '/testing',
                element: <Testing />
            }
        ],
        errorElement: <NotFound />
    },
    {
        path: '/invite',
        element: <Invite />
    },
    {
        path: '*',
        element: <NotFound />
    }
])

export default router;