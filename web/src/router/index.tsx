import { createBrowserRouter } from 'react-router-dom'

import {Login, Register, Classes, ClassDetail, NewClass, Profile, Invite, NotFound, Index} from '../pages'
import {default as PublicLayout} from './PublicLayout'
import {default as ProtectedLayout} from './ProtectedLayout'
import {default as ExamFlowLayout} from './ExamFlowLayout'

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
                path: '/class/add',
                element: <NewClass />
            },
            {
                path: '/profile',
                element: <Profile />
            },

            {
                element: <ExamFlowLayout />,
                children: [
                    {
                        path: '/class/:id/*',
                        element: <ClassDetail />
                    },
                    {
                        path: '/class/:id/exam/:examGroupId/doing',
                        element: <StudentExamDetail />
                    },
                ]
            }
        ],
        errorElement: <NotFound />
    },
    {
        path: '/invite',
        element: <Invite />
    },
    {
        path: '/',
        element: <Index />
    },
    {
        path: '*',
        element: <NotFound />
    }
])

export default router;