/*
 * Copyright 2019 - 2020 Nathan Alo, Ayane Satomi, et al.
 * Licensed under the GNU General Public License v3
 * See LICENSE for details.
 */
/* eslint-disable no-undef */
module.exports = {
    async headers() {
        return [{
            source: "/api/:path*",
            headers: [
                {
                    key: "Cache-Control",
                    value: "s-maxage=1, stale-while-revalidate"
                }
            ]
        }];
    },
    target: "serverless",
    trailingSlash: true
};
