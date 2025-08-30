import { GenerateApplePass } from "~~/server/utils/passkit";
import { defineEventHandler, getQuery, createError } from "h3";
import { z } from "zod";

const VisitorFromQuery = z.preprocess(
	(v) => {
		if (v === "0") return false;
		if (v === "1") return true;
		return v;
	},
	z.boolean({ error: "Please provide a valid visitor query" }),
);

const LocationFromQuery = z.preprocess(
	(v) => {
		if (v === "0") return false;
		if (v === "1") return true;
		return v;
	},
	z.boolean({ error: "Please provide a valid location query" }),
);

const QuerySchema = z.object({
	first_name: z.string().trim().min(1, "Please provide a valid first name query"),
	last_name: z.string().trim().min(1, "Please provide a valid last name query"),
	id: z.string().trim().min(1, "Please provide a valid id query"),
	visitor: VisitorFromQuery,
	location: LocationFromQuery,
});

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const parsedQuery = QuerySchema.safeParse(query);

	if (!parsedQuery.success) {
		const { fieldErrors, formErrors } = parsedQuery.error.flatten();
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid query",
			data: { fieldErrors, formErrors },
		});
	}

	const pass = await GenerateApplePass({
		id: parsedQuery.data.id.toString(),
		first_name: parsedQuery.data.first_name,
		last_name: parsedQuery.data.last_name,
		visitor: parsedQuery.data.visitor,
		location: parsedQuery.data.location,
	});

	setHeader(event, "Content-Disposition", 'attachment; filename="epf.pkpass"');
	setHeader(event, "Content-Type", pass.mimeType);
	setHeader(event, "Cache-Control", "no-store");

	return send(event, pass.getAsBuffer());
});
