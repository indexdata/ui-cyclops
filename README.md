# ui-cyclops

Copyright (C) 2025 Index Data.

This software is distributed under the terms of the GNU Affero General Public License version 3. See the file "[LICENSE](LICENSE)" for more information.


## Overview

This module provides a user interface to [the CYCLOPS system](https://www.indexdata.com/cyclops/), mediated by the back-end module [mod-cyclops](https://github.com/indexdata/mod-cyclops) which presents a RESTful WSAPI to the facilities provided by [the CCMS
middleware](https://pkg.go.dev/github.com/indexdata/ccms).


### Note to self

To insert permissions from the package file:
```
$ yarn -s stripes mod descriptor --full | jq '.[0]' > MD.json
$ curl -w '\n' -X POST -D - -H "Content-type: application/json" -d @MD.json http://localhost:9130/_/proxy/modules
$ curl -w '\n' -X POST -D - -H "Content-type: application/json" -d '{"id": "folio_cyclops-1.1.0"}' http://localhost:9130/_/proxy/tenants/diku/modules
```

## Author

Mike Taylor, [Index Data ApS](https://www.indexdata.com/).
mike@indexdata.com


