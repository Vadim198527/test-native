const input = document.querySelector('.point-creater')
let counter = 0

const points = document.querySelector('.points')
const pointObjects = []

input.onkeypress = e => {
   const value = input.value.trim()
   if (e.which === 13 && value !== '') {
      createPoint(value) // Если нажали Enter и поле ввода непустое, создаем метку
         .then(res => {
            const id = `li${++counter}`
            const pointObject = {
               id,
               text: value,
               pointLink: res
            }
            pointObjects.push(pointObject)
            if (pointObjects.length > 2) {
               updatePolyline(pointObjects)
            } else if (pointObjects.length === 2) {
               createPolyline(pointObjects)
            }

            const li = document.createElement('li');
            li.classList.add('druggable')
            li.setAttribute('id', id)
            const div = document.createElement('div')
            div.style.display = 'inline-block'
            div.style.width = '260px'
            div.innerText = value
            li.appendChild(div)
            div.style.width = li.clientWidth - 5 + 'px'
            const i = document.createElement('i')
            i.className = 'material-icons close'
            i.innerText = 'cancel_presentation'
            li.appendChild(i)
            const container = document.querySelector('.points-container')
            container.appendChild(li)
            input.value = ''
         })
         .catch(e => {
            input.value = ''
            alert('Что-то не удалось!')
            throw  e
         })
   }
}

points.onclick = e => {
   if (e.target.classList.contains('close')) {
      counter--
      const currentLi = e.target.closest('.druggable')
      const id = currentLi.id
      const pointObjectIndex = pointObjects.findIndex(item => item.id === id)
      const pointObject = pointObjects[pointObjectIndex]
      pointObjects.splice(pointObjectIndex, 1)
      deletePoint(pointObject.pointLink)
      updatePolyline(pointObjects)
      currentLi.parentElement.removeChild(currentLi)
      return
   }
}

points.addEventListener('pointsChange', event => {// реализуем перемену точек
   const firstIndex = pointObjects.findIndex(item => item.id === event.firstElementId)
   const secondIndex = pointObjects.findIndex(item => item.id === event.secondElementId)

   const buffer = pointObjects[firstIndex]
   pointObjects[firstIndex] = pointObjects[secondIndex]
   pointObjects[secondIndex] = buffer

   const point1 = pointObjects[firstIndex].pointLink
   const point2 = pointObjects[secondIndex].pointLink
   updatePoint(point1, {title: firstIndex + 1})
   updatePoint(point2, {title: secondIndex + 1})
   updatePolyline(pointObjects)
})

