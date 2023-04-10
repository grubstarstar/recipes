import { curry, find, mapValues } from "lodash";
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
  Params,
} from "react-router-dom";
import "./App.css";

const Unit = {
  Millilitres: "Millilitres",
  FluidOunzes: "FluidOunzes",
  Cup: "Cup",
} as const;

type UnitType = typeof Unit[keyof typeof Unit];

const roundToNearest = curry((toNearest: number, val: number): number => {
  return Math.round(val / toNearest) * toNearest;
});

const roundingByUnit: Record<UnitType, typeof roundToNearest> = {
  [Unit.Millilitres]: roundToNearest(25),
  [Unit.FluidOunzes]: roundToNearest(1 / 2),
  [Unit.Cup]: roundToNearest(1 / 4),
};

const aPerB = [
  {
    a: Unit.Millilitres,
    b: Unit.FluidOunzes,
    ratio: 29.5735,
  },
  {
    a: Unit.Millilitres,
    b: Unit.Cup,
    ratio: 236.588,
  },
];

function convertValue(valA: UnitType, valB: UnitType, quantityOfA: number) {
  if (valA === valB) {
    return quantityOfA;
  }
  const ratioAPerB = find(aPerB, ({ a, b }) => a === valA && b === valB)?.ratio;
  const ratioBPerA = find(aPerB, ({ a, b }) => b === valA && a === valB)?.ratio;
  if (ratioAPerB) {
    return roundingByUnit[valB](quantityOfA / ratioAPerB);
  }
  if (ratioBPerA) {
    return roundingByUnit[valB](quantityOfA * ratioBPerA);
  }
}

function getAllConversions(recipeIngredient: IApiRecipeIngredient) {
  const recipeUnit = recipeIngredient.unit;
  const recipeQuantity = recipeIngredient.quantity;
  if (recipeUnit === undefined || recipeQuantity === undefined) {
    return;
  }
  const conversions = mapValues(Unit, (unit) =>
    convertValue(recipeUnit, unit, recipeQuantity)
  );
  return conversions;
}

interface IApiRecipe {
  slug: string;
  name: string;
  ingredients: IApiRecipeIngredient[];
  method: IApiStep[];
}

interface IApiRecipeIngredient {
  ingredient: IApiIngredient;
  unit?: UnitType;
  quantity?: number;
}

interface IApiIngredient {
  slug: string;
  name: string;
}

interface IApiStep {
  title: string;
  description: string;
}

//db level

interface IRecipe {
  id: string;
  slug: string;
  name: string;
  ingredients: IRecipeIngredient[];
  method: IStep[];
}

interface IRecipeIngredient {
  ingredient: IIngredient;
  unit?: string;
  quantity: number;
}

interface IIngredient {
  id: string;
  slug: string;
  name: string;
}

interface IStep {
  id: string;
  title: string;
  description: string;
}

const recipes: Record<string, IApiRecipe> = {
  muffins: {
    slug: "muffins",
    name: "Vegetable Muffins",
    ingredients: [
      {
        ingredient: {
          slug: "self-raising-flour",
          name: "Self-raising flour",
        },
        quantity: 4,
        unit: Unit.Cup,
      },

      {
        ingredient: {
          slug: "tasty-cheese",
          name: "Tasty Cheese",
        },
        quantity: 4,
        unit: Unit.Cup,
      },

      {
        ingredient: {
          slug: "carrot",
          name: "Carrot",
        },
        quantity: 2,
        unit: Unit.Cup,
      },
      {
        ingredient: {
          slug: "spinach",
          name: "Spinach",
        },
        quantity: 4,
        unit: Unit.Cup,
      },
      {
        ingredient: {
          slug: "zuchini",
          name: "Zuchini",
        },
        quantity: 1,
        unit: Unit.Cup,
      },
      {
        ingredient: {
          slug: "milk",
          name: "Milk",
        },
        quantity: 3,
        unit: Unit.Cup,
      },
      {
        ingredient: {
          slug: "large-egg",
          name: "Large Egg",
        },
        quantity: 4,
      },
      {
        ingredient: {
          slug: "feta",
          name: "Feta",
        },
        quantity: 1,
        unit: Unit.Cup,
      },
    ],
    method: [
      {
        title: "STEP 1",
        description:
          "Pre-heat the oven to 180 °C/356 F and use a light oil spray to line enough muffin trays to make 16 muffins. (Or, use less trays and bake in batches). I recommend using silicone trays for easy removal at the end.",
      },
      {
        title: "STEP 2",
        description:
          "Place all of the ingredients together in a large mixing bowl and stir until completely combined.",
      },
      {
        title: "STEP 3",
        description:
          "Using a spoon, evenly divide the muffin mixture into the greased muffin trays. You should get 16 muffins.",
      },
      {
        title: "STEP 4",
        description:
          "Bake for around 15 minutes, or until the muffins are completely cooked through. Transfer to a wire rack and allow to cool. Serve hot or cold. Enjoy!",
      },
    ],
  },
  "yorkshire-puddings": {
    slug: "yorkshire-puddings",
    name: "Yorkshire Puddings",
    ingredients: [
      {
        ingredient: {
          slug: "egg",
          name: "Egg",
        },
        quantity: 200,
        unit: Unit.Millilitres,
      },
      {
        ingredient: {
          slug: "plain-flour",
          name: "Plain Flour",
        },
        quantity: 200,
        unit: Unit.Millilitres,
      },
      {
        ingredient: {
          slug: "milk",
          name: "Milk",
        },
        quantity: 200,
        unit: Unit.Millilitres,
      },
      {
        ingredient: {
          slug: "sunflower-oil",
          name: "Sunflower oil",
        },
      },
    ],
    method: [
      {
        title: "STEP 1",
        description: "Heat oven to 230C/fan 210C/gas 8.",
      },

      {
        title: "STEP 2",
        description:
          "Drizzle a little sunflower oil evenly into two 4-hole Yorkshire pudding tins or two 12-hole non-stick muffin tins and place in the oven to heat through.",
      },

      {
        title: "STEP 3",
        description:
          "To make the batter, tip 140g plain flour into a bowl and beat in 4 eggs until smooth.",
      },

      {
        title: "STEP 4",
        description:
          "Gradually add 200ml milk and carry on beating until the mix is completely lump-free. Season with salt and pepper.",
      },

      {
        title: "STEP 5",
        description:
          "Pour the batter into a jug, then remove the hot tins from the oven. Carefully and evenly pour the batter into the holes.",
      },

      {
        title: "STEP 6",
        description:
          "Place the tins back in the oven and leave undisturbed for 20-25 mins until the puddings have puffed up and browned.",
      },

      {
        title: "STEP 7",
        description:
          "Serve immediately. You can now cool them and freeze for up to 1 month.",
      },
    ],
  },
};

interface LoaderArgs<TParamKeys extends string> {
  request: Request;
  params: Params<TParamKeys>;
  context?: any;
}

const recipesLoader: LoaderFunction = ({ request }: LoaderArgs<"q">) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  return Object.values(recipes).filter((recipe) => {
    return !q || new RegExp(q, "i").test(recipe.name);
  });
};

const recipeLoader: LoaderFunction = ({ params }: LoaderArgs<"id">) => {
  const recipeId = params.id!;
  return recipes[recipeId];
};

const recipeAction: ActionFunction = async ({
  request,
  params,
}: LoaderArgs<"id">) => {
  const recipeId = params.id!;
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
  const recipes = useLoaderData() as IApiRecipe[];
  const submit = useSubmit();
  return (
    <div>
      <h1>Recipes</h1>
      <Form>
        <input
          name="q"
          type="search"
          onChange={(event) => {
            submit(event.currentTarget.form, {
              replace: true,
            });
          }}
        />
      </Form>
      {recipes.map((recipe) => (
        <Link to={`recipe/${recipe.slug}`}>{recipe.name}</Link>
      ))}
      <Outlet />
    </div>
  );
}

function Recipe() {
  const recipe = useLoaderData() as IApiRecipe;

  return (
    <div className="recipe">
      <h1>{recipe.name}</h1>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ingredient) => {
          const conversions = getAllConversions(ingredient);
          let displayQuantity = "";
          if (ingredient.unit === Unit.Millilitres) {
            displayQuantity = `${ingredient.quantity} ml (${conversions?.FluidOunzes} fl oz)`;
          }
          if (ingredient.unit === Unit.FluidOunzes) {
            displayQuantity = `${conversions?.Millilitres} ml (${ingredient.quantity} fl oz)`;
          }
          if (ingredient.unit === Unit.Cup) {
            displayQuantity = `${ingredient.quantity} cups (${conversions?.Millilitres} ml)`;
          }
          return (
            <li>
              <span>{ingredient.ingredient.name}</span>
              <span>{displayQuantity}</span>
            </li>
          );
        })}
      </ul>
      <ul className="method-list">
        {recipe.method.map((step) => (
          <li>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </li>
        ))}
      </ul>
      <Form method="post">
        <input name="name" type="text" />
        <button type="submit">Save</button>
      </Form>
    </div>
  );
}

export default App;
