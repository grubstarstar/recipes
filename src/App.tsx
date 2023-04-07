import React from 'react';
import { createBrowserRouter, ActionFunction, LoaderFunction, Outlet, Router, RouterProvider, useLoaderData, Form } from "react-router-dom"
import logo from './logo.svg';
import './App.css';

interface IRecipe {
  name: string
}

const recipes: Record<string, IRecipe> = {
  "a": {
    name: "Muffins"
  },
  "b": {
    name: "Waffles"
  },
}

const recipeLoader: LoaderFunction = ({ request, params, context }) => {
  return recipes[(params as any).id as string]
}

const recipeAction: ActionFunction = async ({ request, params, context }) => {
  const recipeId = (params as any).id
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  Object.assign(recipes[recipeId], data)
  return { ok: true }
}

const router = createBrowserRouter([{
  path: "/",
  element: <Main />,
  children: [{
    path: "recipe/:id",
    element: <Recipe />,
    loader: recipeLoader,
    action: recipeAction
  }]
}])

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

function Main() {
  return <div>
    <h1>Recipes</h1>
    <Outlet />
  </div>
}

function Recipe() {
  const recipe = useLoaderData() as IRecipe
  return <div>
    <h1>{recipe.name}</h1>
    <Form method='post'>
      <input type="text" name="name" />
      <button type="submit">Save</button>
    </Form>
  </div>
}


export default App;
