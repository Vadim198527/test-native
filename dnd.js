// Реализация drag and drop
let dragInfo = null
let isNotFinished = false

document.onmousedown = e => {
   if (isNotFinished) {
      return
   }
   const element = DrugInfo.getDruggableElement(e.target);
   if (!element) {
      return
   }

   dragInfo = new DrugInfo({
      drugElement: element,
      mouseX: e.pageX,
      mouseY: e.pageY
   })
}

document.onmousemove = e => {
   if (!dragInfo) {
      return
   }

   if (Math.abs(e.pageX - dragInfo.mouseX) <= 3 && Math.abs(e.pageY - dragInfo.mouseY) <= 3) {
      return
   }

   const liList = [...document.querySelector('.points').querySelectorAll('li')]
   liList.reverse()
   liList.forEach(item => {
      const x = item.offsetLeft
      const width = getComputedStyle(item).width
      const drugItem = new DrugItem({
         item: item,
         y: item.offsetTop
      })
      dragInfo.drugItemsList.unshift(drugItem)
      item.style.position = 'absolute'
      item.style.left = `${x}px`
      item.style.top = drugItem.y + 'px'
      item.style.width = width
      document.body.insertBefore(item, document.body.firstChild)
   })

   if (!dragInfo.avatar) {
      dragInfo.avatar = dragInfo.drugElement.cloneNode()
      const avatar = dragInfo.avatar
      avatar.innerHTML = dragInfo.drugElement.innerHTML
      avatar.classList.add('avatar')
      avatar.style.position = 'absolute'
      avatar.style.width = getComputedStyle(dragInfo.drugElement).width
      avatar.style.left = dragInfo.drugElement.offsetLeft + 'px'
      avatar.style.top = dragInfo.drugElement.offsetTop + 'px'
      avatar.style.zIndex = '9999'
      document.body.appendChild(avatar)
      dragInfo.drugElement.style.visibility = 'hidden'
   }

   const avatar = dragInfo.avatar
   avatar.style.top = e.pageY - dragInfo.shiftY + 'px'

   const drugItem = dragInfo.drugItemsList.find(item => item.item === dragInfo.drugElement)
   for (let i = dragInfo.drugItemsList.length - 1; i >= 0; i--) {
      const item = dragInfo.drugItemsList[i]
      const avatar = dragInfo.avatar
      if (avatar.offsetTop < item.y + item.item.offsetHeight / 2 && drugItem.y > item.y) {
         const yBuffer = drugItem.y
         drugItem.y = item.y
         item.y = yBuffer
         drugItem.item.style.top = drugItem.y + 'px'
         item.item.style.top = item.y + 'px'

         const event = new Event('pointsChange')
         event.firstElementId = drugItem.item.id
         event.secondElementId = item.item.id
         const points = document.querySelector('.points')
         points.dispatchEvent(event)
      }
   }

   for (let i = 0; i < dragInfo.drugItemsList.length; i++) {
      const item = dragInfo.drugItemsList[i]
      const avatar = dragInfo.avatar
      if (avatar.offsetTop + avatar.offsetHeight > item.y + item.item.offsetHeight / 2 && drugItem.y < item.y) {
         const yBuffer = drugItem.y
         drugItem.y = item.y
         item.y = yBuffer
         drugItem.item.style.top = drugItem.y + 'px'
         item.item.style.top = item.y + 'px'

         const event = new Event('pointsChange')
         event.firstElementId = drugItem.item.id
         event.secondElementId = item.item.id
         const points = document.querySelector('.points')
         points.dispatchEvent(event)
      }
   }
}

document.onmouseup = () => {
   if (!dragInfo) {
      return;
   }

   if(!dragInfo.avatar){
      dragInfo = null
      return
   }

   isNotFinished = true
   const avatar = dragInfo.avatar
   const drugItemsList = dragInfo.drugItemsList
   const drugElement = dragInfo.drugElement
   dragInfo = null

   avatar.style.transitionProperty = 'top'
   avatar.style.transitionDuration = '0.3s'
   const drugItem = drugItemsList.find(item => item.item === drugElement)
   avatar.style.top = drugItem.y + 'px'
   const id = setInterval(() => {
      const notFinishedItem = drugItemsList.find(item => item.item.offsetTop !== item.y)
      if (!notFinishedItem) {

         if (avatar.offsetTop === drugItem.y) {
            document.body.removeChild(avatar)
            drugElement.style.visibility = 'visible'
            const fragment = document.createDocumentFragment()
            drugItemsList.sort((a, b) => a.y - b.y)
            drugItemsList.forEach(liItem => {
               liItem.item.style.position = ''
               liItem.item.style.left = ''
               liItem.item.style.top = ''
               liItem.item.style.width = ''
               fragment.appendChild(liItem.item)
            })
            const container = document.querySelector('.points-container')
            container.appendChild(fragment)
            isNotFinished = false
            clearInterval(id)
         }
      }
   }, 10)
}

document.onselectstart = e => false

class DrugInfo {
   constructor({drugElement = {}, mouseX, mouseY}) {
      this.turn = []
      this.drugElement = drugElement
      this.avatar = null
      this.drugItemsList = []
      this.mouseX = mouseX
      this.mouseY = mouseY
      this.shiftY = this.mouseY - this.drugElement.offsetTop
   }

   static getDruggableElement(elem) {
      const result = elem.closest('.druggable')
      return result && !result.classList.contains('avatar') ? result : null
   }
}

class DrugItem {
   constructor({item, y}) {
      this.item = item
      this.y = y
   }
}
