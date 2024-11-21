"use server";

import { getVariableList } from "@/utils/helpers/delivery-variables";

// this server action is used to get around importing server-only code in client components
export const getVariableListAction = async () => getVariableList();
