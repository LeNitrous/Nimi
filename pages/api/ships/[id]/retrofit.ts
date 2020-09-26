/*
 * Copyright 2019 - 2020 Nathan Alo, Ayane Satomi, et al.
 * Licensed under the GNU General Public License v3
 * See LICENSE for details.
 */
import ShipRetrofit from "lib/models/ships/model.ship.retrofit";
import getResolver from "lib/getResolver";
import methods from "lib/methods";
import validate from "lib/validate";
import { GetShipQuery, GetShipSchema } from ".";

export default methods({
    get: validate<GetShipQuery, "query">(
        { schema: GetShipSchema, location: "query" },
        async (req, res) =>
            res.status(200).json(
                await new ShipRetrofit(req.body.id).run(await getResolver())
            )
    )
});