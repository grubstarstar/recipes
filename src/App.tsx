import React from "react";
import {
  createBrowserRouter,
  ActionFunction,
  LoaderFunction,
  Outlet,
  RouterProvider,
  useLoaderData,
  Form,
  Link,
  useSubmit,
} from "react-router-dom";

interface IRecipe {
  id: string;
  name: string;
}

const recipes: Record<string, IRecipe> = {
  a: {
    id: "a",
    name: "Muffins",
  },
  b: {
    id: "b",
    name: "Waffles",
  },
};

const recipesLoader: LoaderFunction = ({ request, params, context }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  return Object.values(recipes).filter((recipe) => {
    return !q || new RegExp(q).test(recipe.name);
  });
};

const recipeLoader: LoaderFunction = ({ request, params, context }) => {
  const recipeId = (params as any).id as string;
  return recipes[recipeId];
};

const recipeAction: ActionFunction = async ({ request, params, context }) => {
  const recipeId = (params as any).id as string;
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  Object.assign(recipes[recipeId], data);
  return { ok: true };
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Recipes />,
    loader: recipesLoader,
    children: [
      {
        path: "recipe/:id",
        element: <Recipe />,
        loader: recipeLoader,
        action: recipeAction,
      },
    ],
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

function Recipes() {
  const recipes = useLoaderData() as IRecipe[];
  const submit = useSubmit();
  return (
    <div>
      <h1>Recipes</h1>
      <Form>
        <input
          name="q"
          type="search"
          onChange={(event) => {
            submit(event.currentTarget.form);
          }}
        />
      </Form>
      {recipes.map((recipe) => (
        <Link to={`recipe/${recipe.id}`}>{recipe.name}</Link>
      ))}
      <Outlet />
    </div>
  );
}

function Recipe() {
  const recipe = useLoaderData() as IRecipe;
  return (
    <div>
      <h1>{recipe.name}</h1>
      <Form method="post">
        <input name="name" type="text" />
        <button type="submit">Save</button>
      </Form>
    </div>
  );
}

export default App;
