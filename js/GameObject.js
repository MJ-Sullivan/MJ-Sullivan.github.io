class GameObject {
    constructor (object, collider=null)
    {
        this.object = object;
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