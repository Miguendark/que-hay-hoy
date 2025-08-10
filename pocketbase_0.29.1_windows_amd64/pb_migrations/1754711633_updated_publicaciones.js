/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1251163057")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number1237995133",
    "max": null,
    "min": 0,
    "name": "likes",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1251163057")

  // remove field
  collection.fields.removeById("number1237995133")

  return app.save(collection)
})
