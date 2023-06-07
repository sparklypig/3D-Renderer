console.clear()

// Set up canvas and drawing context
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 300
canvas.height = 300

// Set up minimap and associated drawing context for testing
const minimap = document.getElementById('minimap')
const minictx = minimap.getContext('2d')

minimap.width = 100
minimap.height = 100

/**
 * This function draws the background on both canvases
 */
function background() {
	// Reset the transform and draw a sky blue background on the canvas
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.fillStyle = '#71c4f5'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	// Set the transform to be centered on the middle of the screen
	ctx.setTransform(1, 0, 0, -1, canvas.width / 2, canvas.height / 2)

	// Reset the transform and clear the background on the minimap
	minictx.setTransform(1, 0, 0, 1, 0, 0)
	minictx.clearRect(0, 0, minimap.width, minimap.height)
	minictx.fillStyle = '#00000022'
	minictx.fillRect(0, 0, minimap.width, minimap.height)
	// Set the transform to be centered on the middle of the minimap
	minictx.setTransform(1, 0, 0, -1, minimap.width / 2, minimap.height / 2)
	
	// Draw the horizontal axis
	minictx.strokeStyle = 'white'
	minictx.beginPath()
	minictx.lineTo(minimap.width / 2, 0)
	minictx.lineTo(-minimap.width / 2, 0)
	minictx.stroke()
	
	// Draw the vertical axis
	minictx.strokeStyle = 'white'
	minictx.beginPath()
	minictx.lineTo(0, minimap.height / 2)
	minictx.lineTo(0, -minimap.height / 2)
	minictx.stroke()
}

/**
 * Represents a Vector
 * 
 * @property {Number[]} vector An array of numbers that makes up the Vector
 */
class Vector {
	/**
	 * Creates an instance of Vector.
	 * @param {Number[]} [vector=[]] An array of numbers that will make up the Vector
	 */
	constructor(vector = []) {
		this.vector = vector
	}

	get x() {
		return this.vector[0]
	}

	set x(value) {
		this.vector[0] = value
	}

	get y() {
		return this.vector[1]
	}

	set y(value) {
		this.vector[1] = value
	}

	get z() {
		if(this.length < 3) {
			throw new Error("No z component, this vector is too small")
		}
		return this.vector[2]
	}
	
	set z(value) {
		if(this.length < 3) {
			throw new Error("No z component, this vector is too small")
		}
		this.vector[2] = value
	}

	/**
	 * Creates an instance of Vector from a Vector3D
	 *
	 * @static
	 * @param {Vector3D} vector A Vector3D to be converted to a Vector
	 * @return {Vector} A Vector converted from a Vector3D
	 */
	static from_vector3d({x, y, z}) {
		return new Vector([x, y, z])
	}

	/**
	 * Sets the value of this Vector to another Vector
	 *
	 * @param {Vector} other The Vector to set this Vector to
	 */
	assign(other) {
		this.vector = [...other.vector]
		return this
	}

	/**
	 * Returns a new Vector that is this Vector scaled by k
	 *
	 * @param {Number} k Constant to scale this Vector by
	 * @return {Vector} A new Vector contructed scaling this Vector by k 
	 */
	scale(k) {
		return new Vector(this.vector.map((value) => value * k))
	}

	/**
	 * Adds this Vector to another Vector and returns a new Vector of their sum
	 *
	 * @param {Vector} other The Vector to add to this Vector
	 * @return {Vector} The sum of the two Vectors
	 */
	add(other) {
		const ret = []

		for(let i = 0; i < this.vector.length; i++) {
			ret.push(this.vector[i] + other.vector[i])
		}

		return new Vector(ret)
	}

	/**
	 * Subtracts this Vector from another Vector and returns a new Vector of their difference
	 *
	 * @param {Vector} other The Vector to subtract from this Vector
	 * @return {Vector} The difference of the two Vectors
	 */
	sub(other) {
		return this.add(other.scale(-1))
	}

	/**
	 * Computes the dot product of this Vector and another Vector and returns a new Vector of their product
	 *
	 * @param {Vector} other The Vector to multiply by this Vector
	 * @return {Vector} The dot product of the two Vectors
	 */
	dot(other) {
		let ret = 0
		for(let i = 0; i < this.vector.length; i++) {
			ret += this.vector[i] * other.vector[i]
		}
		return ret
	}

	/**
	 * Returns the length of this Vector
	 *
	 * @return {Number} The length of this Vector
	 */
	length() {
		return Math.hypot(...this.vector)
	}

	normalized() {
		return this.scale(this.length())
	}

	/**
	 * 
	 * @param {Vector} other 
	 * @param {Number} theta 
	 */
	rotation(other, theta) { 
		const q1 = Quaternion.from_vector3d(other.normalized(), theta / 2)
		const p = Quaternion.from_vector3d(this)
		const q2 = Quaternion.from_vector3d(other.normalized().scale(-1), theta / 2)

		return q1
		.mult(p)
		.mult(q2)
		.to_vector3d()
	}

	rotationX(theta) {
		return this.rotation(new Vector([1, 0, 0]), theta)
	}

	rotationY(theta) {
		return this.rotation(new Vector([0, 1, 0]), theta)
	}

	rotationZ(theta) {
		return this.rotation(new Vector([0, 0, 1]), theta)
	}
	
	rotate(other, theta) {
		return this.assign(this.rotation(other, theta))
	}

	rotateX(theta) {
		return this.assign(this.rotationX(theta))
	}

	rotateY(theta) {
		return this.assign(this.rotationY(theta))
	}

	rotateZ(theta) {
		return this.assign(this.rotationZ(theta))
	}

	translate(other) {
		this.assign(this.add(other))
	}

	transformation(matrix) {
		return matrix.vector_product(this)
	}

	transform(matrix) {
		this.assign(this.transformation(matrix))
	}

	/**
	 * Returns a String representaion of this Vector
	 *
	 * @return {String} A String representation of this Vector
	 */
	toString() {
		return '|' + this.vector.join(' ') + '|'
	}

	/**
	 * Displays the String representation of this Vector
	 */
	display() {
		console.log(this.toString())
	}
}

/**
 * Represents a general Matrix
 */
class Matrix {
	static identity(n) {
		const vectors = []
		for(let i = 0; i < n; i++) {
			const vector = []
			for(let j = 0; j < n; j++) {
				vector.push(i === j ? 1 : 0)
			}
			vectors.push(vector)
		}

		return new Matrix(vectors)
	}

	/**
	 * Creates an instance of Matrix.
	 * @param {Vector[]} [vectors=[]] The Vectors that make up the Matrix
	 */
	constructor(vectors = []) {
		this.vectors = vectors
	}

	/**
	 * Returns the width of this Matrix
	 *
	 * @return {Number} the width of this Matrix
	 */
	width() {
		return this.vectors[0].vector.length
	}

	/**
	 * Returns the height of this Matrix
	 *
	 * @return {Number} the height of this Matrix
	 */
	height() {
		return this.vectors.length
	}

	/**
	 * Returns a new Matrix that is this Matrix scaled by k
	 *
	 * @param {Number} k Constant to scale this Matrix by
	 * @return {Matrix} A new Matrix contructed scaling this Matrix by k 
	 */
	scale(k) {
		return new Matrix(this.vectors.map((vector) => {
			return vector.scale(k)
		}))
	}

	/**
	 * Returns the product of this Matrix and a Vector
	 *
	 * @param {Vector} other The Vector to multiply this Matrix by
	 * @return {Vector} The product of this Matrix and a Vector
	 */
	vector_product(other) {
		return new Vector(this.vectors.map((vector) => {
			return vector.dot(other)
		}))
	}

	/**
	 * Returns the product of this Matrix and another Matrix
	 * 
	 * @param {Matrix} other The Matrix to multiply this Matrix by 
	 * @returns The product of the two Matrices
	 */
	matrix_product(other) {
		// Find the dot product each row of this Matrix...
		const matrix_buffer = []
		for(let j = 0; j < this.vectors.length; j++) {
			// ... and the columns of the other Matrix...
			const vector_buffer = []
			for(let i = 0; i < other.transpose().vectors.length; i++) {
				// Add the dot product to an array of values
				vector_buffer.push(this.vectors[j].dot(other.transpose().vectors[i]))
			}
			// Contruct a vector from each array of values and add that to an array of vectors
			matrix_buffer.push(new Vector(vector_buffer))
		}

		// Construct a matrix from the array of vectors and return it
		return new Matrix(matrix_buffer)
	}

	/**
	 * Returns a new Matrix that is this Matrix transposed
	 *
	 * @return {Matrix} A new Matrix that is this Matrix transposed
	 */
	transpose() {
		const new_matrix = new Matrix()
		for(let i = 0; i < this.vectors[0].vector.length; i++) {
			const new_vector = new Vector()
			for(let j = 0; j < this.vectors.length; j++) {
				new_vector.vector.push(this.vectors[j].vector[i])
			}
			new_matrix.vectors.push(new_vector)
		}

		return new_matrix
	}

	/**
	 * Returns a String representaion of this Matrix
	 *
	 * @return {String} A String representation of this Matrix
	 */
	toString() {
		const rows = []
		for(const vector of this.vectors) {
			const cols = []
			for(const value of vector.vector) {
				cols.push(value)
			}
			rows.push('|' + cols.join(' ') + '|')
		}

		return rows.join('\n')
	}

	/**
	 * Displays the String representation of this Matrix
	 */
	display() {
		console.log(this.toString())
	}
}

/**
 * Represents a Quaternion
 */
class Quaternion {
	/**
	 * Creates an instance of Quaternion.
	 * 
	 * @param {Number} a Represents the real part of the Quaternion
	 * @param {Number} b Represents the real part of the Quaternion
	 * @param {Number} c Represents the real part of the Quaternion
	 * @param {Number} d Represents the real part of the Quaternion
	 */
	constructor(a = 0, b = 0, c = 0, d = 0) {
		this.a = a
		this.b = b
		this.c = c
		this.d = d
	}

	/**
	 * Returns a Vector representation of this Quaternion
	 * 
	 * @returns {Vector} The Vector representation of this Quaternion
	 */
	to_vector() {
		return new Vector([this.a, this.b, this.c, this.d])
	}

	to_vector3d() {
		return new Vector([this.b, this.c, this.d])
	}

	/**
	 * Returns a Matrix representation of this Quaternion
	 * 
	 * @returns {Matrix} The Matrix representation of this Quaternion
	 */
	to_matrix() {
		return new Matrix([
			new Vector([this.a, -this.b, -this.c, -this.d]),
			new Vector([this.b, this.a, -this.d, this.c]),
			new Vector([this.c, this.d, this.a, -this.b]),
			new Vector([this.d, -this.c, this.b, this.a]),
		])
	}

	/**
	 * Returns a Quaternion contructed from a Vector
	 * 
	 * @param {Vector} vector The Vector to convert to a Quaternion 
	 * @returns {Quaternion} The Quaternion generated from the Vector
	 */
	static from_vector(vector) {
		return new Quaternion(...vector.vector)
	}

	static from_vector3d(vector3d, theta = Math.PI / 2) {
		return this.from_vector(new Vector([Math.cos(theta), ...vector3d.scale(Math.sin(theta)).vector]))
	}

	/**
	 * Returns a Quaternion contructed from a Matrix
	 * 
	 * @param {Matrix} matrix The Matrix to convert to a Quaternion 
	 * @returns {Quaternion} The Quaternion generated from the Matrix
	 */
	static from_matrix(matrix) {
		return this.from_vector(matrix.transpose().vectors[0])
	}

	/**
	 * Adds this Quaternion to another and returns a new Quaternion of their sum
	 * 
	 * @param {Quaternion} other The Quaternion that will be added to this Quaternion
	 * @returns {Quaternion} The sum of the two Quaternions
	 */
	add(other) {
		return Quaternion.from_vector(this.to_vector().add(other.to_vector()))
	}

	/**
	 * Multiplies this Quaternion by another and a new Quaternion of their product
	 * 
	 * @param {Quaternion} other The Quaternion that this Quaternion will be multiplied by
	 * @returns The product of the two Quaternions
	 */
	mult(other) {
		return Quaternion.from_matrix(
			this.to_matrix()
			.matrix_product(other.to_matrix())
			)
	}

	/**
	 * Returns a String representaion of this Quaternion
	 *
	 * @return {String} A String representation of this Quaternion
	 */
	toString() {
		return `${this.a} ${this.b < 0 ? '-' : '+'} ${this.b}i ${this.c < 0 ? '-' : '+'} ${this.c}j ${this.d < 0 ? '-' : '+'} ${this.d}k`
	}

	/**
	 * Displays the String representation of this Quaternion
	 */
	display() {
		console.log(this.toString())
	}
}

/**
 * Represents a Square Matrix
 * 
 * @extends {Matrix}
 */
class Square_Matrix extends Matrix{
	/**
	 * Creates an instance of Square_Matrix from a Matrix
	 *
	 * @static
	 * @param {Matrix} matrix A Matrix to be converted to a Square_Matrix
	 * @return {Square_Matrix} A Square_Matrix converted from a Matrix
	 */
	static from_matrix(matrix) {
		if(matrix.width() === matrix.height()) {
			return new Square_Matrix(matrix.vectors.map((vector) => {
				return new Vector(vector.vector.slice())
			}))
		}
		else {
			return matrix
		}
	}
	
	/**
	 * Returns a new Square_Matrix that is this Square_Matrix scaled by k
	 *
	 * @param {Number} k Constant to scale this Matrix by
	 * @return {Square_Matrix} A new Square_Matrix contructed scaling this Square_Matrix by k 
	 */
	scale(k) {
		return Square_Matrix.from_matrix(super.scale(k))
	}

	/**
	 * Returns a new Square_Matrix that is this Square_Matrix transposed
	 *
	 * @return {Square_Matrix} A new Square_Matrix that is this Square_Matrix transposed
	 */
	transpose() {
		return Square_Matrix.from_matrix(super.transpose())
	}

	/**
	 * Returns the determinant of this Square_Matrix
	 *
	 * @return {Number} The determinant of this Square_Matrix
	 */
	determinant() {
		if(this.vectors.length === 1) {
			return this.vectors[0].vector[0]
		}
		else {
			let ret = 0
			
			for(let i = 0; i < this.vectors[0].vector.length; i++) {
				ret += this.vectors[0].vector[i] * ((-2 * (i % 2)) + 1) * this.submatrix(i, 0).determinant()
			}

			return ret
		}
	}

	/**
	 * Returns the submatrix of this Square_Matrix at column i and row j
	 *
	 * @param {Number} i Column number
	 * @param {Number} j Row Number
	 * @return {Square_Matrix} The submatrix of this Square_Matrix at column i and row j
	 */
	submatrix(i, j) {
		const minor = this.vectors.map((current, index) => {
			const test = current.vector.slice(0)
			test.splice(i, 1)
			return new Vector(test)
		})

		minor.splice(j, 1)

		return new Square_Matrix(minor)
	}

	/**
	 * Returns the cofactor matrix of this Square_Matrix
	 *
	 * @return {Square_Matrix} The cofactor matrix of this Square_Matrix
	 */
	cofactor() {
		return new Square_Matrix(this.vectors.map((vector, j) => {
			return new Vector(vector.vector.map((value, i) => {
				return ((-2 * ((i + j) % 2)) + 1) * this.submatrix(i, j).determinant()
			}))
		}))
	}

	/**
	 * Returns the adjugate matrix of this Square_Matrix
	 *
	 * @return {Square_Matrix} The adjugate matrix of this Square_Matrix
	 */
	adjugate() {
		return this.cofactor().transpose()
	}

	/**
	 * Returns the inverse of this Square_Matrix
	 *
	 * @return {Square_Matrix} The inverse of this Square_Matrix
	 */
	inverse() {
		return this.adjugate().scale(1 / this.determinant())
	}
}

/**
 * Represents a face
 * 
 * @property {Vector[]} points The points that make up the vertices of the face
 * @property {String} color The color of the face
 */
class Face {
	/**
	 * Creates an instance of Face.
	 * @property {Vector[]} points The points that make up the vertices of the face
	 * @property {String} [color=null] The color of the face
	 * @property {Vector} center The average of all points in the Face
	 */
	constructor(points, fill = null, stroke = null) {
		this.points = points

		this.fill = fill
		this.fill ??= 'red'

		this.stroke = stroke
		this.stroke ??= '#00000044'

		this.find_center()
	}

	/**
	 * Scales this Face by k
	 *
	 * @param {Number} k The constant to scale this Face by
	 */
	scale(k) {
		for(const point of this.points) {
			point.assign(point.scale(k))
		}
		this.find_center()
	}

	/**
	 * Translates this Face by a Vector3D
	 *
	 * @param {Vector3D} other The Vector3D to translate this Face by
	 */
	translate(other) {
		for(const point of this.points) {
			point.translate(other)
		}
		this.find_center()
	}

	/**
	 * Rotates this Face around a Vector
	 *
	 * @param {Vector} other The vector the face will be rotated around
	 * @param {Number} theta The angle to rotate this Face around the the other Vector
	 */
	rotate(other, theta) {
		const original_center = this.center
		this.translate(original_center.scale(-1))
		for(const point of this.points) {
			point.rotate(other, theta)
		}
		this.translate(original_center)
	}

	/**
	 * Rotates this Face around the x-axis
	 *
	 * @param {Number} theta The angle to rotate this Face around the x-axis
	 */
	rotateX(theta) {
		const original_center = this.center
		this.translate(original_center.scale(-1))
		for(const point of this.points) {
			point.rotateX(theta)
		}
		this.translate(original_center)
	}
	
	/**
	 * Rotates this Face around the y-axis
	 *
	 * @param {Number} theta The angle to rotate this Face around the y-axis
	 */
	rotateY(theta) {
		const original_center = this.center
		this.translate(original_center.scale(-1))
		for(const point of this.points) {
			point.rotateY(theta)
		}
		this.translate(original_center)
	}

	/**
	 * Rotates this Face around the z-axis
	 *
	 * @param {Number} theta The angle to rotate this Face around the z-axis
	 */
	rotateZ(theta) {
		const original_center = this.center
		this.translate(original_center.scale(-1))
		for(const point of this.points) {
			point.rotateZ(theta)
		}
		this.translate(original_center)
	}

	transform(matrix) {
		const original_center = this.center
		this.translate(original_center.scale(-1))
		for(const point of this.points) {
			point.transform(matrix)
		}
		this.translate(original_center)
		
		this.find_center()
	}

	/**
	 * Finds the average of all points in the Face and stores it in this.center
	 *
	 */
	find_center() {
		console.log("find center")
		this.center = this.points.reduce((acc, point) => {
			return acc.add(point)
		}, new Vector([0, 0, 0]))
		.scale(1 / this.points.length)
	}

	copy() {
		return new Face(this.points.map(point => point.scale(1)), this.fill, this.stroke)
	}

	/**
	 * Renders this face on a Camera
	 *
	 * @param {Camera} camera The Camera to render this face on
	 */
	render(camera) {
		ctx.fillStyle = this.fill
		ctx.strokeStyle = this.stroke

		ctx.beginPath()

		for(const point of this.points) {
			const delta = camera.delta(point)

			const k = canvas.width / (Math.tan(camera.view_angle) *  delta.z * 2)
			const {x:x, y:y} = delta.scale(Math.abs(k))
			
			ctx.lineTo(x, y)
		}
		ctx.stroke()
		ctx.fill()
	}
}

/**
 * Represents an object with a position and an orientation
 */
class Object {
	/**
	 * Creates an instance of Object.
	 */
	constructor() {
		// Position
		this.center = new Vector([0, 0, 0])

		// Orientation
		this.right = new Vector([1, 0, 0])
		this.forward = new Vector([0, 1, 0])
		this.up = new Vector([0, 0, 1])
	}

	/**
	 * Translates this Object by a Vector3D
	 *
	 * @param {Vector3D} other The Vector3D to translate this Object by
	 */
	translate(other) {
		this.center.translate(other)
	}

	/**
	 * Rotates this Object around the x-axis
	 *
	 * @param {Number} theta The angle to rotate this Object around the x-axis
	 */
	rotateX(theta) {
		this.right.rotateX(theta)
		this.forward.rotateX(theta)
		this.up.rotateX(theta)
	}
	
	/**
	 * Rotates this Object around the y-axis
	 *
	 * @param {Number} theta The angle to rotate this Object around the y-axis
	 */
	rotateY(theta) {
		this.right.rotateY(theta)
		this.forward.rotateY(theta)
		this.up.rotateY(theta)
	}

	/**
	 * Rotates this Object around the z-axis
	 *
	 * @param {Number} theta The angle to rotate this Object around the z-axis
	 */
	rotateZ(theta) {
		this.right.rotateZ(theta)
		this.forward.rotateZ(theta)
		this.up.rotateZ(theta)
	}

	rotate(vector, theta) {
		this.right.rotate(vector, theta)
		this.forward.rotate(vector, theta)
		this.up.rotate(vector, theta)
	}
}

/**
 * Represents an Object that can be rendered by a Camera
 * 
 * @property {Face[]} faces The Faces of this Renderable_Object
 * @property {Vector3D} faces_center The center of all the Faces of this Renderable_Object
 * @property {Renderable_Object[]} children The children of this Renderable_Object
 * @property {Vector3D} children_center The center of all the children of this Renderable_Object
 * @extends {Object}
 */
class Renderable_Object extends Object{
	/**
	 * Creates an instance of Renderable_Object.
	 */
	constructor() {
		// Call parent constructor
		super()

		// Store all faces of this Renderable_Object
		this.faces = []
		this.faces_center = new Vector([0, 0 ,0])

		// Store all child Renderable_Object of this Renderable_Object
		this.children = []
		this.children_center = new Vector([0, 0, 0])

	}

	/**
	 * Finds the average of all centers of the Faces in this.faces and stores it in this.faces_center
	 */
	find_faces_center() {
		this.faces_center = this.faces.reduce((acc, face) => {
			return acc.add(face.center)
		}, new Vector([0, 0, 0])).scale(1 / this.faces.length)
	}

	/**
	 * Finds the average of all centers of the Children in this.children and stores it in this.children_center
	 */
	find_children_center() {
		this.children_center = this.children.reduce((acc, child) => {
			return acc.add(child.center)
		}, new Vector([0, 0, 0])).scale(1 / this.children.length)
	}

	/**
	 * Finds the weighted average of this.faces_center and this.children_center and stores it in this.center
	 */
	find_center() {
		this.center = new Vector([0, 0, 0])

		if(this.faces.length > 0) {
			this.find_faces_center()
		}

		this.center.translate(this.faces_center.scale(this.faces.length))

		if(this.children.length > 0) {
			this.find_children_center()
		}

		this.center.translate(this.children_center.scale(this.children.length))

		this.center.assign(this.center.scale(1 / (this.faces.length + this.children.length)))
	}
	
	/**
	 * Sorts the Faces in this.faces by their distance from a Camera
	 *
	 * @param {Camera} camera The Camera to sort the Faces by
	 */
	sort_faces(camera) {
		this.faces.sort((a, b) => {
			const da = camera.delta(a.center)
			const db = camera.delta(b.center)
			return db.z - da.z
		})
	}

	/**
	 * Sorts the children in this.faces by their distance from a Camera
	 *
	 * @param {Camera} camera The Camera to sort the children by
	 */
	sort_children(camera) {
		this.children.sort((a, b) => {
			const da = camera.delta(a.center)
			const db = camera.delta(b.center)
			return db.length() - da.length()
		})

	}

	/**
	 * Scales this Renderable_Object, including it's Faces and children
	 *
	 * @param {*} k
	 */
	scale(k) {
		for(const face of this.faces) {
			face.scale(k)
		}

		for(const child of this.children) {
			const child_position = child.center
			child.translate(child_position.scale(-1))
			child.scale(k)
			child.translate(child_position.scale(k))
		}

		// this.find_center()
	}

	/**
	 * Translates this Renderable_Object by a Vector3D, including its Faces and children
	 *
	 * @param {Vector3D} other The Vector3D to translate this Renderable_Object by
	 */
	translate(other) {
		// console.log(this)
		for(const face of this.faces) {
			face.translate(other)
		}
		
		for(const child of this.children) {
			child.translate(other)
		}
		
		this.find_center()
	}

	rotate(other, theta) {
		if(this.faces.length > 0) {
			const faces_center = this.faces_center
			this.translate(faces_center.scale(-1))
			for(const face of this.faces) {
				face.rotate(other, theta)
	
				const face_position = face.center
				face.translate(face_position.scale(-1))
				face_position.rotate(other, theta)
				face.translate(face_position)
			}
			this.translate(faces_center)
		}

		if(this.children.length > 0) {
			const children_center = this.children_center
			this.translate(children_center.scale(-1))
			for(const child of this.children) {
				child.rotate(other, theta)

				const child_position = child.center
				child.translate(child_position.scale(-1))
				child_position.rotate(other, theta)
				child.translate(child_position)
			}
			this.translate(children_center)
		}

		super.rotate(other, theta)
	}

	/**
	 * Rotates this Renderable_Object around the x-axis, including its Faces and children
	 *
	 * @param {Number} theta The angle to rotate this Renderable_Object around the x-axis
	 */
	rotateX(theta) {
		this.rotate(new Vector([1, 0, 0]), theta)
	}
	
	/**
	 * Rotates this Renderable_Object around the y-axis, including its Faces and children
	 *
	 * @param {Number} theta The angle to rotate this Renderable_Object around the y-axis
	 */
	rotateY(theta) {
		this.rotate(new Vector([0, 1, 0]), theta)
	}

	/**
	 * Rotates this Renderable_Object around the z-axis, including its Faces and children
	 *
	 * @param {Number} theta The angle to rotate this Renderable_Object around the z-axis
	 */
	rotateZ(theta) {
		this.rotate(new Vector([0, 0, 1]), theta)
	}

	/**
	 * Renders this Renderable_Object on a Camera, including its Faces and children
	 *
	 * @param {Camera} camera The Camera to render this Renderable_Object on, including its Faces and children
	 */
	render(camera) {
		this.sort_children(camera)

		for(const child of this.children) {
			child.render(camera)
		}

		this.render_faces(camera)
	}

	/**
	 * Renders the Faces of this Renderable_Object on a Camera
	 *
	 * @param {Camera} camera The Camera to render the Faces of this Renderable_Object on
	 */
	render_faces(camera) {
		this.sort_faces(camera)

		for(const face of this.faces) {
			if(camera.delta(face.center).z > 0) {
				face.render(camera)
			}
		}
	}
}

class Rectangle extends Face {
	constructor(width = 1, length = 1, fill = null, stroke = null) {
		super([
			new Vector([1, 1, 0]),
			new Vector([-1, 1, 0]),
			new Vector([-1, -1, 0]),
			new Vector([1, -1, 0]),
		], fill, stroke)

		this.transform(new Matrix([
			new Vector([width, 0, 0]),
			new Vector([0, length, 0]),
			new Vector([0, 0, 1]),
		]))
	}
}

/**
 * Represents a Square
 *
 * @extends {Renderable_Object}
 */
class Square extends Rectangle {
	/**
	 * Creates an instance of Square.
	 * @param {number} [size=1] The size of the Square
	 * @param {string} [color='red'] The color of the Square
	 */
	constructor(size = 1, color = 'red') {
		super(size, size, color)
	}
}

class Circle extends Face {
	constructor(radius, n = 10, fill = null, stroke = null) {
		super([...Array(n)]
			.map((_, i) => {
				const angle = Math.PI * 2 * i / n
				return new Vector([Math.cos(angle), Math.sin(angle), 0])
			}),
			fill, stroke
		)

		this.scale(radius)
	}
}

class Prism extends Renderable_Object {
	/**
	 * 
	 * @param {Face} face 
	 * @param {Number} height 
	 */
	constructor(face, height = 1) {
		super()

		const top = face.copy()
		top.translate(new Vector([0, 0, height]))
		top.name = "top"
		this.faces.push(top)

		const bottom = face.copy()
		bottom.translate(new Vector([0, 0, -height]))
		top.bottom = "bottom"
		this.faces.push(bottom)

		const top_pairs = [...top.points.slice(1), top.points[0]].map((point, i) => [top.points[i], point])
		const bottom_pairs = [...bottom.points.slice(1), bottom.points[0]].map((point, i) => [bottom.points[i], point])
		const sides = top_pairs.map((points, i) => [...points, ...bottom_pairs[i].reverse()])

		sides.forEach(side => {
			this.faces.push(new Face(side, face.fill, face.stroke))
		})

	}
}

class Rectanglular_Prism extends Prism {
	constructor(width = 1, length = 1, height = 1) {
		super(new Rectangle(width, length), height)
	}
}

class Cylinder extends Prism {
	constructor(radius = 1, height = 1, n = 10) {
		super(new Circle(radius, n), height)
	}
}

class Sphere extends Renderable_Object {
	constructor(radius = 1, n = 10) {
		super()

		for(let i = 0; i < n; i++) {
			const longitude = Math.PI * 2 * i / n
			const _longitude = Math.PI * 2 * (i + 1) / n

			for(let j = 0; j < n / 2; j++) {
				const latitude = (-Math.PI / 2) + (Math.PI * 2 * j / n)
				const _latitude = (-Math.PI / 2) + (Math.PI * 2 * (j + 1) / n)

				const face = new Face([
					new Vector([1, 0, 0]).rotateY(latitude).rotateZ(longitude),
					new Vector([1, 0, 0]).rotateY(_latitude).rotateZ(longitude),
					new Vector([1, 0, 0]).rotateY(_latitude).rotateZ(_longitude),
					new Vector([1, 0, 0]).rotateY(latitude).rotateZ(_longitude),
				])

				this.faces.push(face)
			}
		}

		this.scale(radius)
	}
}

/**
 * Represents a Cube
 *
 * @extends {Renderable_Object}
 */
class Cube extends Renderable_Object {
	/**
	 * Creates an instance of Cube.
	 * @param {number} [size=1] The size of the Cube
	 */
	constructor(size = 1) {
		super()

		const front = new Square(1, '#ff0000')
		front.translate(this.forward.scale(1))
		front.rotateX(Math.PI / 2)
		this.faces.push(front)
		front.name = 'front'

		const top = new Square(1, '#00ff00')
		top.translate(this.up.scale(1))
		// top.rotateX(Math.PI / 2)
		this.faces.push(top)

		const right = new Square(1, '#0000ff')
		right.translate(this.right.scale(1))
		right.rotateY(Math.PI / 2)
		this.faces.push(right)

		const back = new Square(1, '#880000')
		back.translate(this.forward.scale(-1))
		back.rotateX(Math.PI / 2)
		this.faces.push(back)
		back.name = 'back'

		const bottom = new Square(1, '#008800')
		bottom.translate(this.up.scale(-1))
		this.faces.push(bottom)

		const left = new Square(1, '#000088')
		left.translate(this.right.scale(-1))
		left.rotateY(Math.PI / 2)
		this.faces.push(left)

		this.scale(size)
	}
}

/**
 * Represents a Camera
 *
 * @extends {Object}
 */
class Camera extends Object{
	/**
	 * Creates an instance of Camera.
	 */
	constructor() {
		super()

		this.center = new Vector([0, 0, 0])
		this.sun = new Vector([0, 1000, 0])
		this.view_angle = Math.PI / 4
		this.minimum_distace = 1

		this.objects = []
	}

	/**
	 * Finds the difference between a Vector3D and the Camera from the Camera's orientation
	 *
	 * @param {Vector3D} vector The Vector3D to find the difference between the Camera 
	 * @return {Vector3D} The difference between the Vector3D and the Camera from the Camera's orientation
	 */
	delta(vector) {
		const camera_basis = new Square_Matrix([
			camera.right,
			camera.up,
			camera.forward,
		]).transpose()

		const camera_origin = camera_basis.inverse().vector_product(camera.center)	
		const inverse_vector = camera_basis.inverse().vector_product(vector)
		const delta = inverse_vector.sub(camera_origin)

		return delta
	}

	/**
	 * Sorts the Objects in this.objects by their distance from this Camera
	 *
	 * @param {Camera} camera
	 */
	sort_objects() {
		this.objects.sort((a, b) => {
			const da = this.delta(a.center)
			const db = this.delta(b.center)
			return db.length() - da.length()
		})
	}

	/**
	 * Renders all the objects in this.objects
	 *
	 */
	render() {
		this.sort_objects()
		for(const obj of this.objects) {
			obj.render(this)
		}
	}
}

/**
 * Represents a Keyboard controller
 *
 * @class Controller
 */
class Controller {
	/**
	 * Creates an instance of Controller.
	 */
	constructor() {
		window.addEventListener('keydown', (event) => {
			this[event.code] = true
			event.preventDefault()
		})
		window.addEventListener('keyup', (event) => {
			this[event.code] = false
			event.preventDefault()
		})

		window.onbeforeunload = function (e) {
			// Cancel the event
			e.preventDefault();
		
			// Chrome requires returnValue to be set
			e.returnValue = 'Really want to quit the game?';
		};
	}

	/**
	 * Polls the keyboard and runs the corresponding action for each key
	 *
	 * @param {Number} dt Teh time that has passed since hte last poll
	 */
	poll(dt) {
		if(this.Space) {
			// console.log("Forward", camera.forward.scale(1))
			// console.log("Up", camera.up.scale(1))
			// console.log("Right", camera.right.scale(1))
			// console.log("Rotate X by", Math.atan2(camera.up.z, camera.up.y))
			// camera.rotateX(Math.atan2(-camera.up.z, camera.up.y))
			// console.log("Rotate Y by ", Math.atan2(camera.forward.x, camera.forward.z))
			// camera.rotateY(Math.atan2(camera.forward.x, camera.forward.z))
			// console.log("Rotate Z by ", Math.atan2(-camera.right.y, camera.right.x))
			// camera.rotateZ(Math.atan2(-camera.right.y, camera.right.x))
			// console.log("Position", camera.center)
			// console.log("Forward", camera.forward)

			// const {x:a, y:b, z:c} = camera.right
			// const {x:d, y:e, z:f} = camera.up
			// const {x:g, y:h, z:i} = camera.forward
			// console.log("Determinant:", a*e*i + b*f*g + e*d*h - a*f*i - b*d*i - c*e*g)
		}
		
		// if(this.KeyR) {
		// }
	
		// Move the Camera down
		if(this.ControlLeft) {
			camera.translate(new Vector([0, 0, 1]).scale(-1).scale(dt * 0.01))
		}
	
		// Move the Camera up
		if(this.ShiftLeft) {
			camera.translate(new Vector([0, 0, 1]).scale(dt * 0.01))
		}
		
		// Move the Camera left
		if(this.KeyA) {
			camera.translate(camera.right.scale(-1).scale(dt * 0.01))
		}
		
		// Move the Camera right
		if(this.KeyD) {
			camera.translate(camera.right.scale(dt * 0.01))
		}
		
		// Move the Camera forward
		if(this.KeyW) {
			camera.translate(camera.forward.scale(dt * 0.01))
		}
		
		// Move the Camera backward
		if(this.KeyS) {
			camera.translate(camera.forward.scale(-1).scale(dt * 0.01))
		}
		
		// if(this.KeyQ) {
		// 	camera.rotateZ(-dt * 0.005)
		// }
		
		// if(this.KeyE) {
		// 	camera.rotateZ(dt * 0.005)
		// }
	
		// Rotate the Camera up
		if(this.ArrowUp) {
			camera.rotate(camera.right, dt * 0.005)
		}
	
		// Rotate the Camera down
		if(this.ArrowDown) {
			camera.rotate(camera.right, -dt * 0.005)
		}
	
		// Rotate the Camera right
		if(this.ArrowRight) {
			camera.rotateZ(-dt * 0.005)
		}
	
		// Rotate the Camera left
		if(this.ArrowLeft) {
			camera.rotateZ(dt * 0.005)
		}
	}
}

let last

const camera = new Camera()
camera.translate(new Vector([5, 0, 0]))
camera.translate(camera.forward.scale(-10))

const cube = new Cube(2)

const cube2 = new Cube(0.2)
cube2.translate(new Vector([5, 0, 0]))

// const rect = new Rectanglular_Prism(2, 3, 4)
const cylinder = new Cylinder(2, 5, 30)
const sphere = new Sphere(2, 40)

camera.objects.push(cube)
camera.objects.push(cube2)
// camera.objects.push(cylinder)
// camera.objects.push(sphere)

const controller = new Controller()

/**
 * Main animation loop
 *
 * @param {Number} timestamp The time that the function in run in milliseconds
 */
function draw(timestamp) {
	last ??= timestamp
	const dt = timestamp - last
	last = timestamp
	background()

	controller.poll(dt)
	
	camera.render()
	window.requestAnimationFrame(draw)

	// Vector.from_vector3d(camera.center).display()
	minictx.save()
	minictx.translate(camera.center.x, camera.center.y)
	minictx.scale(10, 10)
	minictx.fillStyle = 'red'
	minictx.fillRect(-0.25, -0.25, 0.5, 0.5)

	minictx.translate(camera.forward.x, camera.forward.y)
	minictx.fillStyle = 'blue'
	minictx.fillRect(-0.25, -0.25, 0.5, 0.5)
	minictx.restore()

	// minictx.save()
	// minictx.translate(cube.center.x, cube.center.z)
	// minictx.scale(10, 10)
	// minictx.fillStyle = 'green'
	// minictx.fillRect(-0.25, -0.25, 0.5, 0.5)
	// minictx.restore()

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.fillStyle = 'black'
	ctx.fillRect(0, canvas.height, 90, -48)
	ctx.fillStyle = 'white'
	ctx.fillText(`${camera.center.vector.map((x) => {
		return (Math.round(x * 100) / 100).toFixed(2)
	}).join(' ')}`, 10, canvas.height - 30)

	ctx.fillText(`${camera.forward.vector.map((x) => {
		return (Math.round(x * 100) / 100).toFixed(2)
	}).join(' ')}`, 10, canvas.height - 10)
}

window.requestAnimationFrame(draw)