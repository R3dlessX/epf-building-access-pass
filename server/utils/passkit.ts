import { PKPass } from "passkit-generator";
import * as fs from "node:fs";

export type EPFApplePass = {
	first_name: string | null;
	last_name: string | null;
	id: string;
	visitor: boolean;
	location: boolean;
};

export async function GenerateApplePass(data: EPFApplePass): Promise<PKPass> {
	const pass = await PKPass.from(
		{
			model: "./server/model/passkit/epf",
			certificates: {
				signerCert: fs.readFileSync("./certs/cert.pem"),
				signerKey: fs.readFileSync("./certs/private.key"),
				wwdr: fs.readFileSync("./server/model/passkit/AppleWWDRCAG4.pem"),
			},
		},
		{
			serialNumber: "EPF-" + data.id,
		},
	);

	pass.setBarcodes({
		format: "PKBarcodeFormatQR",
		message: data.id,
		altText: "ID: " + data.id,
	});

	if (!data.visitor) {
		pass.secondaryFields.push(
			{
				key: "lproj_last_name",
				label: "NOM",
				value: data.last_name || "Néant",
			},
			{
				key: "first_name",
				label: "lproj_first_name",
				value: data.first_name || "Néant",
			},
		);
	} else {
		pass.secondaryFields.push({
			key: "visitor",
			label: "lproj_status",
			value: "Visiteur",
		});
	}

	if (data.location) {
		pass.setLocations(
			{
				longitude: 48.78904,
				latitude: 48.78904,
				relevantText: "EPF Cachan",
			},
			{
				longitude: 3.87148,
				latitude: 43.60037,
				relevantText: "EPF Montpellier",
			},
			{
				longitude: -2.2038409,
				latitude: 47.27865,
				relevantText: "EPF Saint-Nazaire",
			},
			{
				longitude: 4.06325,
				latitude: 48.26953,
				relevantText: "EPF Troyes",
			},
		);
	}
	return pass;
}
