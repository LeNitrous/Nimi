const getFunctionArgs = require("get-function-arguments");
const RequestError = require("./util/requesterror");
const { readdir, lstat } = require("fs-extra");
const Model = require("./models/base");
const Express = require("express");
const path = require("path");

class Endpoint {
    constructor(path, remoteType) {
        this.path = path;
        this.remoteType = remoteType;
    }

    async method(req, res, next) {
        try {
            const data = await this.action(req, res, next);

            if (data.constructor.prototype instanceof Model) {
                const resolver = req.app.get("resolvers")
                    .find(resolver => resolver.constructor.prototype instanceof this.remoteType &&
                            resolver.lang == req.query.region);

                if (!resolver)
                    throw new Error(`Unable to find resolver \
                    ${this.remoteType.name} (${req.query.region}).`);

                if (!resolver.initialized)
                    throw new Error(`${resolver.constructor.name} has not been initialized.`);

                const dependencies = getFunctionArgs(data.load);
                const resolved = [];
                for (let d of dependencies) {
                    resolved.push(await resolver.resolve(d));
                }
                await data.load(...resolved);

                res.jsonp(data.serialize());
            } else
                res.jsonp(data);
        } catch (error) {
            next(new RequestError(error.status || 500, "An error has occured", error));
        }
    }

    async action(req, res) {
        res.statusCode(204);
        return { message: "Endpoint is incomplete" };
    }
}

Endpoint.load = async function(dir, router) {
    let endpoints = await readdir(dir);

    for (let artifact of endpoints) {
        let stats = await lstat(`${dir}/${artifact}`);

        if (stats.isFile() && artifact.endsWith(".js")) {
            let file = require(path.resolve(`${dir}/${artifact}`));

            if (file && file.prototype instanceof Endpoint) {
                let endpoint = new file();
                router.get(endpoint.path, endpoint.method.bind(endpoint));
            }
        }

        if (stats.isDirectory()) {
            let sub = Express.Router({ mergeParams: true });
            router.use(`/${artifact}`, sub);

            await Endpoint.load(`${dir}/${artifact}`, sub);
        }
    }
};

module.exports = Endpoint;