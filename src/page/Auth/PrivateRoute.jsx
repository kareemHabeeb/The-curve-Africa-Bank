import React from 'react'
import { useSelector } from 'react-redux';
import {Outlet, Navigate} from "react-router-dom"

const PrivateRoute = () => {
    const user = useSelector(state => state.apiInfo.accessToken)
  return (
    user !== null? <Outlet />:<Navigate to="/" replace/>
  )
}

export default PrivateRoute