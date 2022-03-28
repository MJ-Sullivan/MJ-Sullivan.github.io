class GameObject {
    constructor (object, model, collider=null)
    {
        if (object != undefined) {
            this.object = object;
            this.name = object.name;
        }
        this.model = model;
        this.colliders = []
        if (collider != null)
            this.colliders.push(collider);
    }
}

class Collider {
    constructor (mesh, boxHelper)
    {
        this.mesh = mesh;
        this.boxHelper = boxHelper;
    }
}